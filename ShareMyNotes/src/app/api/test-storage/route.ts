import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      return NextResponse.json({ 
        error: 'Auth error', 
        details: authError.message 
      }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        details: 'Please sign in first'
      }, { status: 401 })
    }

    // Get the exact bucket name by trying common variations
    const bucketNames = ['uploads', 'Uploads', 'UPLOADS']
    let workingBucket: string | null = null
    
    for (const bucketName of bucketNames) {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 1 })
      
      if (!error) {
        workingBucket = bucketName
        break
      }
    }

    if (!workingBucket) {
      return NextResponse.json({
        error: 'No accessible bucket found',
        triedBuckets: bucketNames,
        hint: 'Make sure bucket is named exactly "uploads" (lowercase)'
      }, { status: 404 })
    }

    // Try a test upload
    const testContent = new Blob(['test'], { type: 'text/plain' })
    const testPath = `${user.id}/test-${Date.now()}.txt`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(workingBucket)
      .upload(testPath, testContent)

    if (uploadError) {
      return NextResponse.json({
        success: false,
        bucket: workingBucket,
        canRead: true,
        canWrite: false,
        error: uploadError.message,
        errorDetails: JSON.stringify(uploadError),
        userId: user.id,
        testPath: testPath,
        hint: 'The INSERT policy needs: WITH CHECK (bucket_id = \'uploads\')',
        manualFix: 'In Supabase Dashboard > Storage > uploads > Policies, edit your INSERT policy and set WITH CHECK to: bucket_id = \'uploads\''
      })
    }

    // Clean up test file
    await supabase.storage.from(workingBucket).remove([testPath])

    return NextResponse.json({
      success: true,
      message: 'Storage is working correctly!',
      bucket: workingBucket,
      user: { id: user.id, email: user.email },
      canRead: true,
      canWrite: true
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
