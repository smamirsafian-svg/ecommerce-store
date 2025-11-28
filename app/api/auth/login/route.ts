import { getServerSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  const supabase = await getServerSupabase();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_BASE_URL + "/auth/callback",
    },
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ ok: true });
}

