import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const supabase = createServerSupabaseClient();
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id');

  let query = supabase.from('winners').select('*, draws(draw_date, winning_numbers), profiles(email, full_name)');
  if (userId) query = query.eq('user_id', userId);
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request) {
  const supabase = createServerSupabaseClient();
  const body = await request.json();
  const { id, ...updates } = body;

  if (updates.verification_status === 'approved' || updates.verification_status === 'rejected') {
    updates.verified_at = new Date().toISOString();
  }

  const { data, error } = await supabase.from('winners').update(updates).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
