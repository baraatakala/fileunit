import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vdyuepooqnkwyxnjncva.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeXVlcG9vcW5rd3l4bmpuY3ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjY3NDQsImV4cCI6MjA3Mjc0Mjc0NH0.Vq71PYlP5x9KYYdPjCSmYUjp-5mCTaYhJAYdAeZXcNw';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Storage bucket name
export const STORAGE_BUCKET = 'construction-files';
