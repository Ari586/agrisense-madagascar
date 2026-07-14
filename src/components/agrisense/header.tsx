'use client'

import { useTheme } from 'next-themes'
import { Leaf, Moon, Sun, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion } from 'framer-motion'

const REGIONS = [
  { value: 'antananarivo', label: 'Antananarivo' },
  { value: 'toamasina', label: 'Toamasina' },
  { value: 'antsirabe', label: 'Antsirabe' },
  { value: 'mahajanga', label: 'Mahajanga' },
  { value: 'fianarantsoa', label: 'Fianarantsoa' },
  { value: 'toliara', label: 'Toliara' },
  { value: 'antsiranana', label: 'Antsiranana' },
]

export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Madagascar flag accent bar */}
          <div className="flex h-8 w-1 rounded-full overflow-hidden flex-col">
            <div className="flex-1 bg-red-500" />
            <div className="flex-1 bg-white dark:bg-gray-400" />
            <div className="flex-1 bg-green-600" />
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight text-foreground">
                AgriSense
              </span>
              <span className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase">
                Madagascar
              </span>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          {/* Region selector */}
          <Select defaultValue="antananarivo">
            <SelectTrigger className="w-auto gap-1.5 h-9 text-xs sm:text-sm border-dashed">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <SelectValue placeholder="Région" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
  )
}