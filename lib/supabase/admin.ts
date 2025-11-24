import { createClient } from '@supabase/supabase-js'

/**
 * Supabase admin client with service role key
 * Use this for admin operations, OTP, and admin panel features
 * WARNING: Never expose this client to the browser
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

