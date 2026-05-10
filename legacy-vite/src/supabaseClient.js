import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log a warning if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('CRITICAL: Supabase URL or Anon Key is missing. Please check your environment variables in Vercel settings.');
}

// Create the Supabase client with fallback values to prevent initialization crash
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
