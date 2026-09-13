import { createClient } from '@supabase/supabase-js';

// PERINGATAN: Client ini menggunakan SUPABASE_SERVICE_ROLE_KEY
// Hanya boleh diimpor dan dieksekusi di Server-Side (API Routes / Cron Jobs / Server Actions)
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL atau Service Role Key belum dikonfigurasi di environment variable.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
