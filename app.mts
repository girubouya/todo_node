import { IncomingMessage, ServerResponse, createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createUser, existUser } from './lib/users.mjs';
import {
  createSession,
  deleteSession,
  existSession,
  getSession,
} from './lib/sessions.mjs';
import { createTodo, listTodos, removeTodo, updateTodo } from './todos.mjs';

const server = createServer();
const PORT = process.env.PORT ?? 3000;
const extensions: Record<string, string | undefined> = {
  '.js': 'text/javascript',
  '.css': 'text/css',
};
//testGIT;;!
//test2

//サーバー起動
server.listen(PORT, () => {
  console.log(`Listen on ${PORT}`);
});

//新規登録HTML読み込み
async function getRegister(req: IncomingMessage, res: ServerResponse) {
  const index = await readFile('./register.html');
  res.end(index);
}

//新規登録処理
async function postRegister(req: IncomingMessage, res: ServerResponse) {
  let data = '';
  req.on('data', (chunk) => {
    data += chunk;
  });

  req.on('end', async () => {
    const [usernameKV, passwordKV, passwordConfirmKV] = data.split('&');
    const [_u, username] = usernameKV.split('=');
    const [_p, password] = passwordKV.split('=');
    const [_pc, passwordConfirm] = passwordConfirmKV.split('=');

    if (password !== passwordConfirm) {
      res.statusCode = 400;
      res.end('password not match');
      return;
    }

    await createUser(username, password);
    res.end('Created!!');
  });
}

//ログインHTML読み込み
async function getLogin(req: IncomingMessage, res: ServerResponse) {
  const index = await readFile('./login.html');
  res.end(index);
}

//ログインボタン押された時の処理
async function postLogin(req: IncomingMessage, res: ServerResponse) {
  let data = '';
  req.on('data', (chunk) => {
    data += chunk;
  });

  req.on('end', async () => {
    try {
      const [usernameKV, passwordKV] = data.split('&');
      const [_u, username] = usernameKV.split('=');
      const [_p, password] = passwordKV.split('=');
      const result = await existUser(username, password);
      if (!result) {
        res.statusCode = 401;
        res.end('not exist');
        return;
      }
      const { id } = await createSession(username);
      res.writeHead(302, {
        Location: '/',
        'set-cookie': `session=${id}`,
      });
      res.end();
    } catch (e) {
      console.error(e);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });
}

//ホームHTML読み込み
async function getIndex(req: IncomingMessage, res: ServerResponse) {
  const index = await readFile('./index.html');
  res.end(index);
}

//静的ファイル読み込み
async function getStaticFiles(
  req: IncomingMessage,
  res: ServerResponse,
  url: string
) {
  const file = await readFile(path.resolve(path.join('.', url)));
  const ext = extensions[path.extname(url)];
  if (!ext) {
    res.statusCode = 404;
    res.end('Not Found');
    return;
  }
  res.writeHead(200, {
    'Content-Type': ext,
  });
  res.end(file);
}

//ログインユーザーがどうかチェック
async function checkUser(
  req: IncomingMessage
): Promise<{ username: string; id: string } | null> {
  const rowCookie = req.headers.cookie;
  const cookies = rowCookie?.split('; ');
  if (!cookies || cookies.length === 0) {
    return null;
  }
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === 'session') {
      const session = await getSession(value);
      if (session) {
        return session;
      } else {
        return null;
      }
    }
  }
  return null;
}

async function postTodo(
  req: IncomingMessage,
  res: ServerResponse,
  session: { username: string; id: string }
) {
  let data = '';
  req.on('data', (chunk) => {
    data += chunk;
  });
  req.on('end', async () => {
    const todo = JSON.parse(data);
    console.log(todo);
    const result = await createTodo(todo.title, session.username);
    res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    res.end(JSON.stringify(result));
  });
}

async function putTodo(
  req: IncomingMessage,
  res: ServerResponse,
  session: { username: string; id: string }
) {
  const id = req.url?.substring('/todos/'.length);
  let data = '';
  req.on('data', (chunk) => {
    data += chunk;
  });
  req.on('end', async () => {
    const todo = JSON.parse(data);
    todo.id = id;
    console.log(todo);
    await updateTodo(todo);
    res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    res.end(JSON.stringify(todo));
  });
}

async function deleteTodo(
  req: IncomingMessage,
  res: ServerResponse,
  session: { username: string; id: string }
) {
  const id = req.url?.substring('/todos/'.length);

  console.log(id);
  if (id) {
    await removeTodo(id);
    res.statusCode = 204;
    res.end();
  } else {
    res.statusCode = 400;
    res.end('bad!!');
    return;
  }
}

async function getTodos(
  req: IncomingMessage,
  res: ServerResponse,
  session: { username: string; id: string }
) {
  const todos = await listTodos(session.username);
  res.writeHead(200, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(todos));
}

server.on('request', async (req: IncomingMessage, res: ServerResponse) => {
  try {
    //cssの読み込み
    if (req.url?.startsWith('/public') && req.method === 'GET') {
      await getStaticFiles(req, res, req.url);
      return;
    }

    if (req.url === '/register' && req.method === 'GET') {
      await getRegister(req, res);
      return;
    }

    if (req.url === '/register' && req.method === 'POST') {
      await postRegister(req, res);
      return;
    }

    if (req.url === '/login' && req.method === 'GET') {
      await getLogin(req, res);
      return;
    }

    if (req.url === '/login' && req.method === 'POST') {
      await postLogin(req, res);
      return;
    }

    //認可(ログイン)処理
    const session = await checkUser(req);
    if (!session) {
      res.writeHead(302, {
        Location: '/login',
      });
      res.end();
      return;
    }
    if (req.url === '/logout') {
      await deleteSession(session.id);
      res.writeHead(302, {
        Location: '/login',
      });
      res.end();
      return;
    }

    //todo追加
    if (req.url === '/todos' && req.method === 'POST') {
      await postTodo(req, res, session);
      return;
    }
    //todo一覧取得
    if (req.url === '/todos' && req.method === 'GET') {
      await getTodos(req, res, session);
      return;
    }
    //todo編集
    if (req.url?.startsWith('/todos') && req.method === 'PUT') {
      putTodo(req, res, session);
      return;
    }
    //todo削除
    if (req.url?.startsWith('/todos') && req.method === 'DELETE') {
      deleteTodo(req, res, session);
      return;
    }

    //home画面の読み込み
    if (req.url === '/' && req.method === 'GET') {
      await getIndex(req, res);
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }
  } catch (e) {
    res.statusCode = 500;
    res.end(e);
    console.error(e);
  }
});
