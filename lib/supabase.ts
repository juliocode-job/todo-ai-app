import { createClient } from '@supabase/supabase-js';

export interface Todo {
  id: string;
  user_identifier: string;
  title: string;
  description?: string;
  ai_enhanced_description?: string;
  steps?: Array<{ step: number; description: string }>;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env.local file');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);