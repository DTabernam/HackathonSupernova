import Link from 'next/link'
import { Button } from '@/components/Button/Button'
import { Icon } from '@/components/Icon/Icon'
import { appName, appDescription } from '@/lib/constants'
import { Navbar } from '@/components/Navbar/Navbar'
import PDFDisplayer from '@/components/PDFViewer/PDFViewer'

export default function CourseDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar/>
      <main className="flex flex-col items-center">
        <div className="mt-6 w-4/5 flex justify-center">
          <PDFDisplayer doc="doc1" height={600} />
        </div>
      </main>
    </div>
  )
}
