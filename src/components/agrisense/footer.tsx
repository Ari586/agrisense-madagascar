'use client'

import { Leaf } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto w-full px-2 sm:px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Leaf className="h-4 w-4 text-primary" />
            <span>
              Fambolena eto Madagasikara &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <img src="/assets/DRPMA.png" alt="DRPMA Logo" className="h-8 w-auto object-contain" />
          </div>
        </div>
      </div>
    </footer>
  )
}