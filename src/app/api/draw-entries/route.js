import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const supabase = createServerSupabaseClient();
  const { draw_id, user_id } = await request.json();

  // Get user's latest 5 scores
  const { data: scores } = await supabase
    .from('scores')
    .select('score')
    .eq('user_id', user_id)
    .order('played_date', { ascending: false })
    .limit(5);

  if (!scores || scores.length < 5) {
    return NextResponse.json({ error: 'You need 5 scores to enter a draw' }, { status: 400 });
  }

  const scoreValues = scores.map(s => s.score);

  const { data, error } = await supabase
    .from('draw_entries')
    .insert({ draw_id, user_id, scores: scoreValues })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Already entered this draw' }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
