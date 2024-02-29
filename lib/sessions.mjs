import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://bvzkizdntdpufesfscby.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2emtpemRudGRwdWZlc2ZzY2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg5OTY4MDksImV4cCI6MjAyNDU3MjgwOX0.4aPXvlIH6WggA_PyJ0XtAP0leCs62bT_LSHdTnRmRSQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export async function createSession(username) {
    //セッション削除
    await supabase.from('sessions').delete().eq('username', username);
    //セッション作成
    const { error: insertError } = await supabase
        .from('sessions')
        .insert({ username });
    if (insertError) {
        throw insertError;
    }
    const { data, error } = await supabase
        .from('sessions')
        .select()
        .eq('username', username);
    if (error) {
        throw error;
    }
    if (!data || data.length === 0) {
        return { id: null };
    }
    //セッションIDをデータベースからとる
    return data[0];
}
export async function existSession(id) {
    const { data, error } = await supabase.from('sessions').select().eq('id', id);
    if (error) {
        return false;
    }
    if (!data || data.length === 0) {
        return false;
    }
    return true;
}
export async function getSession(id) {
    const { data, error } = await supabase.from('sessions').select().eq('id', id);
    if (error) {
        throw error;
    }
    if (!data || data.length === 0) {
        return null;
    }
    return data[0];
}
export async function deleteSession(id) {
    const { error } = await supabase.from('sessions').delete().eq('id', id);
    if (error) {
        console.error(error);
    }
    return;
}
