import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const { status } = await request.json();

  if (!status) return NextResponse.json({ error: 'status required' }, { status: 400 });

  const db = createServerClient();
  const { data, error } = await db
    .from('candidates')
    .update({ status })
    .eq('uuid', uuid)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
