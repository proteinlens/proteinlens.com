import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'

export function BottomNav() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card md:hidden">
      <div className="flex items-center justify-around h-16">
        <Link
          to="/"
          className={cn(
            'flex flex-col items-center justify-center flex-1 h-16 text-xs transition-colors',
            isActive('/') 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Home"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v7a1 1 0 001 1h2m2-4h4m0 0h2a1 1 0 011 1v7a1 1 0 01-1 1h-2m0-4V9m0 0H9m4 0h4" />
          </svg>
          Home
        </Link>

        <Link
          to="/history"
          className={cn(
            'flex flex-col items-center justify-center flex-1 h-16 text-xs transition-colors',
            isActive('/history')
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label="History"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          History
        </Link>

        <Link
          to="/settings"
          className={cn(
            'flex flex-col items-center justify-center flex-1 h-16 text-xs transition-colors',
            isActive('/settings')
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Settings"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </Link>
      </div>
    </nav>
  )
}
