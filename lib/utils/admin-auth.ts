import { getServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Helper function to check if the current user is an admin
 * Returns the user object if admin, null otherwise
 * Automatically redirects if not authenticated or not admin
 * 
 * @returns Promise<{ user: any, profile: any }> - User and profile if admin
 */
export async function requireAdmin() {
  const supabase = await getServerSupabase();

  // Step 1: Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Step 2: Get user profile with role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  // If profile doesn't exist or error, treat as not admin
  if (profileError || !profile) {
    redirect("/");
  }

  // Step 3: Check if user has admin role
  if (profile.role !== "admin") {
    redirect("/");
  }

  return {
    user,
    profile,
  };
}

/**
 * Check if user is admin without redirecting
 * Useful for conditional rendering
 * 
 * @returns Promise<boolean> - True if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return profile?.role === "admin";
  } catch {
    return false;
  }
}

