import Link from 'next/link'
import { Button } from '@/components/Button/Button'
import { Icon } from '@/components/Icon/Icon'
import { appName } from '@/lib/constants'

export function Navbar() {
  return (
    <nav className="bg-gray-400 flex items-center justify-between w-full mx-auto">
        <div className="grid gap-auto size-full text-center grid-cols-3">
            <Link href="\notes" className="hover:bg-slate-300 flex justify-center items-center">
                <span className="flex justify-center items-center">
                    <Icon name="edit" size={28} />
                    <p className="font-semibold text-xl">Notes</p>
                </span>
            </Link>
            <Link href="\report" className="hover:bg-slate-300 py-4 border-x-4 px-4 border-solid border-black flex justify-center items-center">
                <span className="flex justify-center items-center">
                    <Icon name="eye" size={28} />
                    <p className="font-semibold text-xl">Report</p>
                </span>
            </Link>
            <Link href="\course_docs" className="hover:bg-slate-300 flex justify-center items-center">
                <span className="flex justify-center items-center">
                    <Icon name="book" size={28} />
                    <p className="font-semibold text-xl">Course Material</p>
                </span>
            </Link>
        </div>
    </nav>
  )
}