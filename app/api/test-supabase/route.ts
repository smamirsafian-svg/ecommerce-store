import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

