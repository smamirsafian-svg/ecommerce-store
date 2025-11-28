import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

export async function getServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name);
          const value = cookie?.value;
          
          // Log PKCE-related cookies for debugging
          if (name.includes("code-verifier") || name.includes("pkce")) {
            console.log(`[PKCE] Reading cookie: ${name.substring(0, 20)}...`, {
              found: !!value,
              valueLength: value?.length ?? 0,
            });
          }
          
          return value;
        },
        set(name: string, value: string, options: {
          domain?: string;
          expires?: Date;
          httpOnly?: boolean;
          maxAge?: number;
          path?: string;
          sameSite?: "lax" | "strict" | "none";
          secure?: boolean;
        }) {
          try {
            // In Next.js 15, cookies can only be modified in Server Actions or Route Handlers
            // In Server Components, this will silently fail, which is expected behavior
            // Cookies will be properly written by middleware or Route Handlers
            const cookieOptions = {
              httpOnly: options?.httpOnly ?? true,
              secure: options?.secure ?? process.env.NODE_ENV === "production",
              sameSite: (options?.sameSite ?? "lax") as "lax" | "strict" | "none",
              path: options?.path ?? "/",
              ...(options?.maxAge && { maxAge: options.maxAge }),
              ...(options?.expires && { expires: options.expires }),
              ...(options?.domain && { domain: options.domain }),
            };
            
            // Log PKCE-related cookies for debugging
            if (name.includes("code-verifier") || name.includes("pkce")) {
              console.log(`[PKCE] Setting cookie: ${name.substring(0, 20)}...`, {
                path: cookieOptions.path,
                httpOnly: cookieOptions.httpOnly,
                secure: cookieOptions.secure,
                sameSite: cookieOptions.sameSite,
              });
            }
            
            cookieStore.set(name, value, cookieOptions);
          } catch (error) {
            // In Next.js 15, cookies() can only be modified in Server Actions or Route Handlers
            // This is expected behavior in Server Components - silently ignore the error
            // The Supabase client will still work for reading data, and cookies will be
            // properly managed by middleware or Route Handlers
          }
        },
        remove(name: string, options: {
          domain?: string;
          path?: string;
        }) {
          try {
            // In Next.js 15, cookies can only be modified in Server Actions or Route Handlers
            // In Server Components, this will silently fail, which is expected behavior
            cookieStore.delete(name, {
              path: options?.path ?? "/",
              ...(options?.domain && { domain: options.domain }),
            });
          } catch (error) {
            // In Next.js 15, cookies() can only be modified in Server Actions or Route Handlers
            // This is expected behavior in Server Components - silently ignore the error
          }
        },
      },
    }
  );
}
