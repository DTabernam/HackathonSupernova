import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/test-feedback - Test feedback table insert
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not logged in', details: userError }, { status: 401 })
    }

    // Check if feedback table exists and we can select
    const { data: existingFeedback, error: selectError } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', user.id)
      .limit(5)

    // Get an upload to link feedback to
    const { data: uploads } = await supabase
      .from('uploads')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (!uploads || uploads.length === 0) {
      return NextResponse.json({
        error: 'No uploads found - upload a file first',
        selectWorks: !selectError,
        existingFeedback: existingFeedback?.length || 0,
      })
    }

    // Try to insert test feedback
    const { data: testFeedback, error: insertError } = await supabase
      .from('feedback')
      .insert({
        user_id: user.id,
        upload_id: uploads[0].id,
        feedback_type: 'test',
        feedback_content: 'Test feedback content',
      })
      .select()
      .single()

    // Clean up if successful
    if (testFeedback) {
      await supabase.from('feedback').delete().eq('id', testFeedback.id)
    }

    return NextResponse.json({
      success: !insertError,
      user: user.id,
      selectWorks: !selectError,
      existingFeedback: existingFeedback || [],
      existingFeedbackCount: existingFeedback?.length || 0,
      insertError: insertError ? {
        message: insertError.message,
        code: insertError.code,
        hint: insertError.hint,
      } : null,
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
