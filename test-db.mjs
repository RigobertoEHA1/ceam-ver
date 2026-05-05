import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

console.log("URL:", supabaseUrl);
console.log("Key:", supabaseAnonKey ? "Present" : "Missing");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('constancias').select('*');
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Data:", data);
  }
}
test();
