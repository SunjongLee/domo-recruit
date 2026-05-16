import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const { message } = await request.json();

  if (!message?.trim()) return NextResponse.json({ error: 'message required' }, { status: 400 });

  const db = createServerClient();
  const { error } = await db
    .from('candidates')
    .update({ message })
    .eq('uuid', uuid);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
