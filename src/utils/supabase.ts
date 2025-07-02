
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Add console logs to debug the connection
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Supabase Key:', supabaseKey ? 'Set' : 'Missing');

let supabase;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env file or Supabase integration.');
  // Create a dummy client to prevent crashes
  supabase = createClient('https://dummy.supabase.co', 'dummy-key');
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };
