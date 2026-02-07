import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/test-upload - Test if uploads table has content column
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not logged in', details: userError }, { status: 401 })
    }

    // Try to select from uploads to see columns
    const { data: uploads, error: selectError } = await supabase
      .from('uploads')
      .select('*')
      .limit(1)

    // Try to insert a test record with content
    const { data: testInsert, error: insertError } = await supabase
      .from('uploads')
      .insert({
        user_id: user.id,
        file_name: 'test.txt',
        file_type: 'txt',
        file_size: 100,
        file_url: 'local://test',
        storage_path: 'test/test.txt',
        title: 'Test Upload',
        is_public: false,
        content: 'This is test content', // The new column!
      })
      .select()
      .single()

    // Clean up test record if it was created
    if (testInsert) {
      await supabase.from('uploads').delete().eq('id', testInsert.id)
    }

    return NextResponse.json({
      success: !insertError,
      user: user.id,
      selectWorks: !selectError,
      existingUploads: uploads?.length || 0,
      insertError: insertError ? {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
      } : null,
      hint: insertError?.message?.includes('content') 
        ? 'The "content" column does not exist. Run this SQL in Supabase:\n\nALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS content TEXT;'
        : insertError 
          ? 'Check the error message above'
          : 'Upload with content column works!',
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
