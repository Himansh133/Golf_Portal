import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const supabase = createServerSupabaseClient();
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id');

  if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('played_date', { ascending: false })
    .limit(5);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  const supabase = createServerSupabaseClient();
  const { user_id, score, played_date } = await request.json();

  if (score < 1 || score > 45) {
    return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 });
  }

  // Get existing scores count
  const { data: existing } = await supabase
    .from('scores')
    .select('id, played_date')
    .eq('user_id', user_id)
    .order('played_date', { ascending: true });

  // If 5 scores exist, delete the oldest
  if (existing && existing.length >= 5) {
    await supabase.from('scores').delete().eq('id', existing[0].id);
  }

  const { data, error } = await supabase
    .from('scores')
    .insert({ user_id, score, played_date })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request) {
  const supabase = createServerSupabaseClient();
  const { id } = await request.json();
  const { error } = await supabase.from('scores').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
