'use client'

import { Leaf } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Leaf className="h-4 w-4 text-primary" />
            <span>
              AgriSense Madagascar &copy; {new Date().getFullYear()} — Plateforme IA pour
              l&apos;agriculture intelligente
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Madagascar flag colors */}
            <div className="h-3 w-4 rounded-sm bg-red-500" />
            <div className="h-3 w-4 rounded-sm bg-white dark:bg-gray-300" />
            <div className="h-3 w-4 rounded-sm bg-green-600" />
          </div>
        </div>
      </div>
    </footer>
  )
}