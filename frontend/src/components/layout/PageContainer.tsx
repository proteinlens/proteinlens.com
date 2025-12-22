import React from 'react'
import { cn } from '@/utils/cn'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main 
      className={cn(
        'flex-1 pb-20 md:pb-0',
        className
      )}
    >
      {children}
    </main>
  )
}
