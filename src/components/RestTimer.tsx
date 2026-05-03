'use client'

import { useState, useEffect } from 'react'
import { X, Timer } from 'lucide-react'

interface Props {
  totalSeconds: number
  onDismiss: () => void
}

export default function RestTimer({ totalSeconds, onDismiss }: Props) {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    if (remaining <= 0) {
      onDismiss()
      return
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining, onDismiss])

  const pct = (remaining / totalSeconds) * 100
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const isUrgent = remaining <= 10

  return (
    <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 overflow-hidden">
      {/* progress bar */}
      <div className="h-1 bg-zinc-800 relative">
        <div
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${
            isUrgent ? 'bg-red-500' : 'bg-orange-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <Timer className={`w-4 h-4 ${isUrgent ? 'text-red-400 animate-pulse' : 'text-orange-400'}`} />
          <span className="text-xs text-zinc-400">Dinlenme süresi</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-mono font-semibold tabular-nums ${
              isUrgent ? 'text-red-400' : 'text-orange-400'
            }`}
          >
            {mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`}
          </span>
          <button
            type="button"
            onClick={onDismiss}
            className="p-0.5 text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
