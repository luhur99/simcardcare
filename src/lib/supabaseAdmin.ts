import { createClient } from "@supabase/supabase-js";

// Server-only client — uses service_role key.
// NEVER import this file from client-side code (pages, components, hooks).
// Only use in src/pages/api/** routes.
const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
