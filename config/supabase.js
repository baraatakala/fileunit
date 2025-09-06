import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vdyuepooqnkwyxnjncva.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key-here';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Storage bucket name
export const STORAGE_BUCKET = 'construction-files';
