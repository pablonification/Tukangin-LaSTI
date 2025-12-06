import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton browser client
let client: ReturnType<typeof createBrowserClient> | null = null

// Client-side Supabase client for browser usage with PKCE flow
export function getSupabaseBrowser() {
  if (!client) {
    client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
      }
    })
  }
  return client
}

// Keep old export for backward compatibility during migration
export const supabase = getSupabaseBrowser()
