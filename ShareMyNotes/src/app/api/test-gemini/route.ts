import { NextRequest, NextResponse } from 'next/server'

// GET /api/test-gemini - Test Gemini API connection
export async function GET(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 })
  }

  // First, list available models
  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    const listResponse = await fetch(listUrl)
    const listData = await listResponse.json()
    
    if (!listResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to list models',
        details: listData 
      }, { status: 500 })
    }

    // Get model names
    const models = listData.models?.map((m: any) => m.name) || []
    
    // Try a simple generation with the model from env or find one
    const envModel = process.env.GEMINI_MODEL
    const modelToUse = envModel 
      ? `models/${envModel}`
      : models.find((m: string) => m.includes('gemini-2.5-flash')) 
        || models.find((m: string) => m.includes('gemini-2.0-flash'))
        || models.find((m: string) => m.includes('gemini-pro'))
        || models[0]

    if (!modelToUse) {
      return NextResponse.json({ 
        error: 'No suitable model found',
        availableModels: models 
      }, { status: 500 })
    }

    // Extract just the model name (remove 'models/' prefix)
    const modelName = modelToUse.replace('models/', '')
    
    const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`
    const genResponse = await fetch(genUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say "Hello, Gemini works!"' }] }],
      }),
    })

    const genData = await genResponse.json()

    return NextResponse.json({
      success: genResponse.ok,
      modelUsed: modelName,
      availableModels: models.slice(0, 10), // First 10 models
      response: genData.candidates?.[0]?.content?.parts?.[0]?.text || null,
      error: genData.error || null,
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Request failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
