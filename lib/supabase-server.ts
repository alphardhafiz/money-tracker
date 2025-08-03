import { createClient } from "@supabase/supabase-js";

// Hanya dipakai di server
export function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase URL and Key must be provided as environment variables."
    );
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function getUser() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error("Failed to get Supabase user: " + error.message);
  }

  return user;
}
