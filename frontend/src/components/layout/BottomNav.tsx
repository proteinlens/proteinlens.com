import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { Home, Target, Clock, Settings } from 'lucide-react'

export function BottomNav() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  // Hide bottom nav on pricing page since user is already there
  if (location.pathname === '/pricing') {
    return null
  }

  const linkClass = (path: string) =>
    cn(
      'flex flex-col items-center justify-center flex-1 h-16 text-xs transition-colors duration-200 cursor-pointer',
      'active:scale-95',
      isActive(path)
        ? 'text-primary'
        : 'text-muted-foreground hover:text-foreground'
    )

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card md:hidden z-40">
      <div className="flex items-center justify-around h-16">
        <Link to="/" className={linkClass('/')} aria-label="Home">
          <Home className="w-6 h-6 mb-1" />
          Home
        </Link>

        <Link to="/protein-calculator" className={linkClass('/protein-calculator')} aria-label="Protein Calculator">
          <Target className="w-6 h-6 mb-1" />
          Calculator
        </Link>

        <Link to="/history" className={linkClass('/history')} aria-label="History">
          <Clock className="w-6 h-6 mb-1" />
          History
        </Link>

        <Link to="/settings" className={linkClass('/settings')} aria-label="Settings">
          <Settings className="w-6 h-6 mb-1" />
          Settings
        </Link>
      </div>
    </nav>
  )
}
