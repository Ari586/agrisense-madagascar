'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Image from 'next/image'

export function DeveloperInfo() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-24 sm:bottom-4 left-4 z-[40] h-12 w-12 rounded-full bg-transparent text-primary hover:bg-primary/10"
          aria-label="A propos"
        >
          <Info className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-extrabold">Momba ny Mpamorona</DialogTitle>
          <DialogDescription className="text-center">
            Information sur le créateur de Fambolena
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-4 h-28 w-28 overflow-hidden rounded-full border-4 border-primary/20 shadow-xl">
            {/* We use standard img for simplicity to avoid next/image host config issues if any */}
            <img
              src="/assets/arie.JPG"
              alt="Ari Havana"
              className="h-full w-full object-cover"
            />
          </div>
          <h3 className="text-lg font-bold text-foreground">Ari Havana</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Mpamorona sy mpampivelatra (Developer & Creator) ity application ity.
          </p>
          
          <div className="flex flex-col items-center gap-2">
            <a
              href="https://paypal.me/LahatraAriel"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#003087] text-white shadow-lg transition-transform hover:-translate-y-1 hover:bg-[#001c66]"
              title="Tohanana amin'ny PayPal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106a.641.641 0 0 1-.633.74zM10.887 7.037c.33 0 .684-.006 1.033-.006 2.539 0 4.604-.498 5.06-2.827.15-.754.062-1.256-.25-1.611-.311-.354-1.077-.526-2.256-.526H6.945L5.054 14.15h3.042c3.55 0 5.864-1.458 6.55-5.011.2-.552.12-1.082-.042-1.522-.162-.44-.452-.802-.857-1.048-.405-.246-.922-.387-1.54-.387h-1.32z"/>
              </svg>
            </a>
            <span className="text-xs font-bold uppercase tracking-wider text-[#003087]">
              Tohano eto
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
