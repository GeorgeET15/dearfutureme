import { createClient } from "@supabase/supabase-js";

// Replace with your Supabase URL and Anon Key
const supabaseUrl = "https://kwejvucvnwjhbouqqoli.supabase.co";
// Replace with your Supabase URL
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3ZWp2dWN2bndqaGJvdXFxb2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2MDU0MjAsImV4cCI6MjA0NzE4MTQyMH0.nhXJLDd5EkynjOMg5Ugo9b43Wq--NWh9LyJZt7_yIGQ"; // Replace with your Supabase public anon key

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
