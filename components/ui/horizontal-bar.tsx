// components/ui/horizontal-bar.tsx
export function Bar({ value, max, className }: { value: number; max: number; className?: string }) {
    const pct = Math.round((value / max) * 100)
    return (
      <div className={`h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}>
        <div
          className="h-full bg-gradient-to-r from-[#006A4E] to-[#FFCE00] rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    )
  }