import { createClient } from '@supabase/supabase-js';
import { promises } from 'node:dns';

const SUPABASE_URL = 'https://bvzkizdntdpufesfscby.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2emtpemRudGRwdWZlc2ZzY2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg5OTY4MDksImV4cCI6MjAyNDU3MjgwOX0.4aPXvlIH6WggA_PyJ0XtAP0leCs62bT_LSHdTnRmRSQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function createUser(username: string, password: string) {
  const { error } = await supabase.from('users').insert({ username, password });
  if (error) {
    throw error;
  }
}

export async function existUser(
  username: string,
  password: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('username', username)
    .eq('password', password);

  if (error) {
    throw error;
  }
  if (!data || data.length === 0) {
    return false;
  }
  return true;
}
