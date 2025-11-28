import { getServerSupabase } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";



export async function GET(req: Request) {

  const url = new URL(req.url);

  const code = url.searchParams.get("code");



  if (!code) {

    console.error("[AUTH CALLBACK] No code parameter provided");

    return NextResponse.redirect(new URL("/auth/login?error=no_code", req.url));

  }



  try {
    // Explicitly read all cookies before code exchange to ensure they're available
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    console.log("[AUTH CALLBACK] Available cookies:", {
      count: allCookies.length,
      names: allCookies.map(c => c.name).filter(name => 
        name.includes("supabase") || name.includes("code") || name.includes("pkce")
      ),
    });

    const supabase = await getServerSupabase();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);



    if (error) {

      console.error("[AUTH CALLBACK] exchangeCodeForSession error:", {

        message: error.message,

        status: error.status,

        name: error.name,

        code: code.substring(0, 20) + "...", // Log partial code for debugging

      });

      return NextResponse.redirect(

        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, req.url)

      );

    }



    if (!data.session) {

      console.error("[AUTH CALLBACK] No session returned after code exchange");

      return NextResponse.redirect(

        new URL("/auth/login?error=no_session", req.url)

      );

    }



    console.log("[AUTH CALLBACK] Successfully authenticated user:", data.user?.id);

    return NextResponse.redirect(new URL("/", req.url));

  } catch (error) {

    console.error("[AUTH CALLBACK] Unexpected error:", error);

    return NextResponse.redirect(

      new URL(

        `/auth/login?error=${encodeURIComponent(

          error instanceof Error ? error.message : "unexpected_error"

        )}`,

        req.url

      )

    );

  }

}

