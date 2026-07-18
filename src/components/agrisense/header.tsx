'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, Search, Calculator, Sprout, CalendarDays, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import { CROPS_DATA } from '@/components/agrisense/legacy-data'

export function Header() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  const navigateToTab = (tab: string) => {
    window.dispatchEvent(new CustomEvent('changeTab', { detail: tab }))
  }

  const navigateToCrop = (cropKey: string) => {
    navigateToTab('sahako')
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('openCrop', { detail: cropKey }))
    }, 100)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="relative mx-auto flex h-14 w-full items-center justify-between px-2 sm:px-4">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col leading-none"
            >
              <span className="text-base font-bold tracking-tight text-foreground">
                Fambolena
              </span>
              <span className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase">
                eto Madagasikara
              </span>
            </motion.div>
          </div>

          {/* Centered MINAE Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-10">
            <img src="/Minae.png" alt="MINAE Logo" className="h-full w-auto object-contain rounded-sm" />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Input Button */}
            <div className="relative flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="w-9 px-0 sm:w-[220px] sm:px-4 flex justify-center sm:justify-start text-xs sm:text-sm text-muted-foreground bg-muted/50 border-dashed"
                onClick={() => setOpen(true)}
              >
                <Search className="h-4 w-4 shrink-0 sm:mr-2" />
                <span className="hidden sm:inline truncate">Hikaroka eto...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Basculer le thème"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </div>
      </header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Mitady fitaovana na fampahalalana momba ny voly..." />
        <CommandList>
          <CommandEmpty>Tsy misy valiny.</CommandEmpty>
          <CommandGroup heading="Fitaovana (Outils)">
            <CommandItem onSelect={() => runCommand(() => navigateToTab('sahako'))}>
              <Sprout className="mr-2 h-4 w-4" />
              <span>Sahako (Mon Champ)</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigateToTab('tetiandro'))}>
              <CalendarDays className="mr-2 h-4 w-4" />
              <span>Tetiandro Fambolena</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigateToTab('kajy'))}>
              <Calculator className="mr-2 h-4 w-4" />
              <span>Kajy (Calculateur)</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigateToTab('hafa'))}>
              <Bot className="mr-2 h-4 w-4" />
              <span>Miresaka amin'ny IA</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Voly (Cultures)">
            {Object.entries(CROPS_DATA).map(([key, crop]) => (
              <CommandItem key={key} onSelect={() => runCommand(() => navigateToCrop(key))}>
                <span className="mr-2 text-lg">{crop.emoji}</span>
                <span>{crop.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{crop.cat}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}