import { createClient } from '@/lib/supabase/server'
import { analyzeNotesWithAI } from '@/lib/ai'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/analyze - Analyze an uploaded file with AI
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { uploadId, courseContent } = body // Optional course content for context

    if (!uploadId) {
      return NextResponse.json({ error: 'Upload ID required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the upload (verify ownership) - includes content field
    const { data: upload, error: uploadError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .eq('user_id', user.id)
      .single()

    if (uploadError || !upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
    }

    // Check if feedback already exists
    const { data: existingFeedback } = await supabase
      .from('feedback')
      .select('*')
      .eq('upload_id', uploadId)
      .single()

    if (existingFeedback) {
      // Return existing feedback instead of error
      return NextResponse.json({
        success: true,
        feedback: {
          id: existingFeedback.id,
          annotatedNotes: existingFeedback.feedback_content,
          createdAt: existingFeedback.created_at,
        },
        cached: true,
      })
    }

    // Get file content directly from database
    const fileContent = upload.content
    
    if (!fileContent) {
      return NextResponse.json({ 
        error: 'No content found for this upload. Please re-upload the file.' 
      }, { status: 400 })
    }

    // Call AI to analyze the notes
    const aiResult = await analyzeNotesWithAI({
      notes: fileContent,
      context: courseContent || undefined,
      courseTitle: upload.title,
    })

    if (!aiResult.success) {
      return NextResponse.json({ 
        error: aiResult.error || 'Failed to analyze notes' 
      }, { status: 500 })
    }

    // Store the feedback in the database
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        user_id: user.id,
        upload_id: uploadId,
        feedback_type: 'ai-annotation',
        feedback_content: aiResult.annotatedNotes,
      })
      .select()
      .single()

    if (feedbackError) {
      console.error('Error saving feedback:', feedbackError)
      // Still return the analysis even if saving failed
      return NextResponse.json({
        success: true,
        feedback: {
          annotatedNotes: aiResult.annotatedNotes,
        },
        saved: false,
      })
    }

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        annotatedNotes: aiResult.annotatedNotes,
        createdAt: feedback.created_at,
      },
    })

  } catch (error) {
    console.error('Error in analyze API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/analyze?uploadId=xxx - Get existing feedback for an upload
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const uploadId = searchParams.get('uploadId')

    if (!uploadId) {
      return NextResponse.json({ error: 'Upload ID required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get feedback for this upload (only if user owns it)
    const { data: feedback, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('upload_id', uploadId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !feedback) {
      return NextResponse.json({ feedback: null })
    }

    // Also get summary if exists
    const { data: summary } = await supabase
      .from('summaries')
      .select('*')
      .eq('upload_id', uploadId)
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      feedback: {
        id: feedback.id,
        content: feedback.feedback_content,
        score: feedback.score,
        suggestions: feedback.suggestions,
        type: feedback.feedback_type,
        createdAt: feedback.created_at,
      },
      summary: summary ? {
        text: summary.summary_text,
        keyPoints: summary.key_points,
        topics: summary.topics,
      } : null
    })

  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
