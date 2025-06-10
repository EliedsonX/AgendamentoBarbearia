
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://usdknseadrmluqaellgv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZGtuc2VhZHJtbHVxYWVsbGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDc2MzYsImV4cCI6MjA2NTA4MzYzNn0.JRDdPJrOdm6p4Olska2rDNp9pKn9zf7kTTxKT0j2s-4";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);