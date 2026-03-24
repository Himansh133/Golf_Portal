import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const supabase = createServerSupabaseClient();
  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';

  let query = supabase.from('charities').select('*').order('featured', { ascending: false });
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  const supabase = createServerSupabaseClient();
  const body = await request.json();
  const { data, error } = await supabase.from('charities').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request) {
  const supabase = createServerSupabaseClient();
  const body = await request.json();
  const { id, ...updates } = body;
  const { data, error } = await supabase.from('charities').update(updates).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request) {
  const supabase = createServerSupabaseClient();
  const { id } = await request.json();
  const { error } = await supabase.from('charities').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
