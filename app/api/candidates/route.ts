import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const db = createServerClient();
  const { data, error } = await db
    .from('candidates')
    .select('*, feedbacks(*)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { name, email, phone, position } = await request.json();

  if (!name || !email || !phone || !position) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const db = createServerClient();
  const { data, error } = await db
    .from('candidates')
    .insert({ uuid: uuidv4(), name, email, phone, position, status: '서류심사중' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
