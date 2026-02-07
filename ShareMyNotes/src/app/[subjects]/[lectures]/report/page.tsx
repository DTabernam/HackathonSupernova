import Link from 'next/link'
import { Button } from '@/components/Button/Button'
import { Icon } from '@/components/Icon/Icon'
import { appName, appDescription } from '@/lib/constants'
import { Navbar } from '@/components/Navbar/Navbar'

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar/>
      <main>
        <p>This is the Report page</p>
      </main>
    </div>
  )
}
