import { getServerSupabase } from "@/lib/supabase/server";

import { NextResponse } from "next/server";



export async function GET() {

  const supabase = await getServerSupabase();



  const { data: { user }, error } = await supabase.auth.getUser();



  if (error || !user) {

    return NextResponse.json({ session: null });

  }



  return NextResponse.json({

    session: { user },

  });

}
