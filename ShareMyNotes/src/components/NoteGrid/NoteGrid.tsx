'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export type Note = {
  id: string
  title: string
  preview?: string
}

type Props = {
  notes: Note[]
  onNoteClick?: (noteId: string) => void
}

export function NoteGrid({ notes, onNoteClick }: Props) {
  const [selectedNote, setSelectedNote] = useState<string | null>(null)

  function handleClick(noteId: string) {
    setSelectedNote(noteId)
    onNoteClick?.(noteId)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
      {notes.map((note) => (
        <button
          key={note.id}
          onClick={() => handleClick(note.id)}
          className={`aspect-square rounded-lg border-2 border-gray-300 p-4 flex flex-col items-center justify-center transition-all cursor-pointer hover:shadow-lg hover:border-blue-500 ${
            selectedNote === note.id ? 'border-blue-500 shadow-lg' : ''
          }`}
        >
          <div className="text-2xl mb-2">📄</div>
          <p className="text-sm font-semibold text-center text-text-primary line-clamp-2">{note.title}</p>
          {note.preview && <p className="text-xs text-text-secondary mt-1 line-clamp-1">{note.preview}</p>}
        </button>
      ))}
    </div>
  )
}
