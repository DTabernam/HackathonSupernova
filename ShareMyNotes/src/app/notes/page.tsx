'use client'

import Link from 'next/link'
import { Button } from '@/components/Button/Button'
import { Icon } from '@/components/Icon/Icon'
import { appName, appDescription } from '@/lib/constants'
import { Navbar } from '@/components/Navbar/Navbar'
import { NoteGrid } from '@/components/NoteGrid/NoteGrid'

// Mock notes data - replace with actual data from your backend
const mockNotes = [
  { id: '1', title: 'Biology Notes', preview: 'Chapter 1: Cell Structure' },
  { id: '2', title: 'Physics Notes', preview: 'Newton\'s Laws' },
  { id: '3', title: 'Chemistry Notes', preview: 'Periodic Table' },
  { id: '4', title: 'Math Notes', preview: 'Calculus' },
  { id: '5', title: 'History Notes', preview: 'World War II' },
  { id: '6', title: 'English Literature', preview: 'Shakespeare' },
  { id: '7', title: 'Geography Notes', preview: 'World Capitals' },
  { id: '8', title: 'Computer Science', preview: 'Data Structures' },
  { id: '9', title: 'Economics Notes', preview: 'Supply and Demand' },
  { id: '10', title: 'Art History', preview: 'Renaissance' },
  { id: '11', title: 'Music Theory', preview: 'Chords and Scales' },
  { id: '12', title: 'Philosophy', preview: 'Plato\'s Republic' },
]

export default function HomePage() {
  function handleNoteClick(noteId: string) {
    // TODO: open note details modal or page
    console.log('Clicked note:', noteId)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar/>
      <main className="px-6 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-6">My Notes</h1>
        <NoteGrid notes={mockNotes} onNoteClick={handleNoteClick} />
      </main>
    </div>
  )
}
