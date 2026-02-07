/**
 * AI Service for Note Analysis
 * Using Google Gemini for large context window (1M tokens)
 */

export interface NoteAnalysisInput {
  notes: string
  context?: string // Course content (optional)
  courseTitle?: string
}

export interface NoteAnalysisResult {
  success: boolean
  annotatedNotes: string
  error?: string
}

const SYSTEM_PROMPT = `You are an expert academic reviewer. Your job is to review student notes and annotate them inline based on course content.

Guidelines:
- Only annotate issues that would materially affect understanding or correctness.
- Underline in color any incorrect, misleading, ambiguous, or significantly incomplete statements.
- Insert short inline reviewer comments immediately after the affected text, using the same color as the underline.
- Do NOT use symbols, labels, or headings to indicate issue types.
- Do NOT comment on correct or sufficiently complete content.
- Do NOT suggest stylistic or optional improvements.
- Do NOT rewrite, remove, or add content beyond inline annotations.
- Use HTML span tags inside Markdown to apply color and underlining.
- All output must be valid Markdown.

Color coding:
- Red (#ef4444): Incorrect or misleading information
- Orange (#f97316): Ambiguous statements that could be misunderstood
- Yellow (#eab308): Significantly incomplete (missing critical details)

Example annotation format:
<span style="text-decoration: underline; text-decoration-color: #ef4444; color: #ef4444;">incorrect statement</span> <span style="color: #ef4444; font-size: 0.85em;">[This is actually X, not Y]</span>

Return ONLY the annotated notes in valid Markdown format. If the notes are completely correct, return them unchanged.`

function buildUserPrompt(input: NoteAnalysisInput): string {
  let prompt = `Given the following student notes:\n\n${input.notes}\n\n`
  
  if (input.context) {
    prompt += `And the following authoritative course content:\n\n${input.context}\n\n`
  } else if (input.courseTitle) {
    prompt += `Course: ${input.courseTitle}\n\n`
  }
  
  prompt += `Task: Review the notes verbatim and annotate them inline based on the information provided. If no course content is given, use your general knowledge to identify factual errors.`
  
  return prompt
}

/**
 * Analyze notes using Google Gemini API (1M token context!)
 */
export async function analyzeNotesWithAI(input: NoteAnalysisInput): Promise<NoteAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    return {
      success: false,
      annotatedNotes: '',
      error: 'Gemini API key not configured. Add GEMINI_API_KEY to your .env file.',
    }
  }

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT + '\n\n' + buildUserPrompt(input) }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Gemini API error:', errorData)
      return {
        success: false,
        annotatedNotes: '',
        error: `Gemini API error: ${errorData.error?.message || response.statusText}`,
      }
    }

    const data = await response.json()
    const annotatedNotes = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!annotatedNotes) {
      return {
        success: false,
        annotatedNotes: '',
        error: 'No response from AI',
      }
    }

    return {
      success: true,
      annotatedNotes,
    }
  } catch (error) {
    console.error('AI analysis error:', error)
    return {
      success: false,
      annotatedNotes: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
