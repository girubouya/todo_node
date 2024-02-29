function submitTodo() {
  const form = document.getElementById('form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    if (!title) {
      return;
    }
    const res = await fetch('/todos', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    const todo = await res.json();
    const todosElement = document.getElementById('todos');
    const li = createTodoListItem(todo);
    todosElement.appendChild(li);
    // location.reload();
    e.target.title.value = '';
  });
}

async function handleUpdate(e) {
  const id = e.target.getAttribute('data-todo-id');
  const div = document.createElement('div');
  div.action = `/todos/${id}`;
  div.method = 'PUT';
  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'edit';
  const submitButton = document.createElement('input');
  submitButton.type = 'submit';
  submitButton.value = '編集';
  const li = document.getElementById(`listitem-${id}`);
  div.append(input, submitButton);
  li.appendChild(div);
  submitButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const editTitle = document.getElementById('edit');
    editTitleValue = editTitle.value;
    await fetch(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ id: id, title: editTitleValue }),
    });
    const label = document.getElementById(`label-${id}`);
    label.textContent = editTitleValue;
    div.remove();
    // location.reload();
  });
}
async function handleDelete(e) {
  const id = e.target.getAttribute('data-todo-id');
  await fetch(`/todos/${id}`, { method: 'DELETE' });
  const li = document.getElementById(`listitem-${id}`);
  const todosElement = document.getElementById('todos');
  todosElement.removeChild(li);
}
async function handleCheck(e) {
  console.log(e.target.checked);
  console.log(e.target.id);

  const id = e.target.id;
  const checked = e.target.checked;
  const label = document.getElementById(`label-${id}`);
  await fetch(`/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ done: checked }),
  });
  if (checked) {
    label.setAttribute('style', 'text-decoration:line-through;');
  } else {
    label.removeAttribute('style');
  }
}

function createTodoListItem(todo) {
  const li = document.createElement('li');
  li.className = 'todo-listitem';
  li.id = `listitem-${todo.id}`;
  const div = document.createElement('div');
  div.title = 'todo title';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = todo.id;
  checkbox.addEventListener('click', handleCheck);
  const label = document.createElement('label');
  label.htmlFor = todo.id;
  label.textContent = todo.title;
  label.id = `label-${todo.id}`;
  const updateButton = document.createElement('input');
  updateButton.type = 'button';
  updateButton.setAttribute('data-todo-id', todo.id);
  updateButton.addEventListener('click', handleUpdate);
  updateButton.value = 'update';
  const deleteButton = document.createElement('input');
  deleteButton.type = 'button';
  deleteButton.setAttribute('data-todo-id', todo.id);
  deleteButton.addEventListener('click', handleDelete);
  deleteButton.value = 'delete';
  div.append(checkbox, label, updateButton, deleteButton);
  li.appendChild(div);

  return li;
}

async function listTodos() {
  const todosElement = document.getElementById('todos');
  const res = await fetch('/todos', { method: 'GET' });
  const todos = await res.json();
  for (const todo of todos) {
    const li = createTodoListItem(todo);
    todosElement.appendChild(li);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  submitTodo();
  await listTodos();
});
