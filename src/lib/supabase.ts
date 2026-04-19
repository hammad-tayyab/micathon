import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Database client connection.
 * This file sets up the connection to our Supabase database, allowing the app to fetch users, jobs, and send updates.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
