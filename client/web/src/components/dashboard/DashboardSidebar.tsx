'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, List, Box, Calendar, GitCompare } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/throws', label: 'Throws', icon: List },
  { href: '/dashboard/rounds', label: 'Rounds', icon: Calendar },
  { href: '/dashboard/replay', label: 'Shot replay', icon: Box },
  { href: '/dashboard/compare', label: 'Compare', icon: GitCompare },
] as const

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-card">
      <div className="p-4 border-b border-border">
        <Link href="/dashboard" className="font-semibold text-foreground hover:opacity-80">
          DiscDawg
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === href || (pathname.startsWith(href + '/') && href !== '/dashboard')
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
