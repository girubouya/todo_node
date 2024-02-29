import { createClient } from '@supabase/supabase-js';
import { promises } from 'node:dns';
import crypto from 'node:crypto';

const SUPABASE_URL = 'https://bvzkizdntdpufesfscby.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2emtpemRudGRwdWZlc2ZzY2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg5OTY4MDksImV4cCI6MjAyNDU3MjgwOX0.4aPXvlIH6WggA_PyJ0XtAP0leCs62bT_LSHdTnRmRSQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type Todo = {
  id: string;
  title: string;
  username: string;
  done: boolean;
};

export async function createTodo(
  title: string,
  username: string
): Promise<Todo> {
  const id = crypto.randomUUID();
  const todo: Todo = {
    id,
    title,
    username,
    done: false,
  };
  const { error } = await supabase.from('todos').insert(todo);
  if (error) {
    throw error;
  }
  return todo;
}

export async function listTodos(username: string): Promise<Array<Todo>> {
  const { data, error } = await supabase
    .from('todos')
    .select()
    .eq('username', username)
    .order('created_at');

  if (error) {
    throw error;
  }
  if (!data) {
    return [];
  }
  return data;
}

export async function updateTodo(todo: Todo) {
  const { error } = await supabase.from('todos').update(todo).eq('id', todo.id);
  if (error) {
    throw error;
  }
}

export async function removeTodo(id: string) {
  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) {
    throw error;
  }
}
