import { createClient } from '@supabase/supabase-js';
import type { Candidate, FeedbackItem } from './mockData';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anonKey);

export function createServerClient() {
  return createClient(url, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false },
  });
}

export type { Candidate, FeedbackItem };
