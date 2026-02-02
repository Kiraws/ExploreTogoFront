import { IconPhotoOff } from "@tabler/icons-react"

export default function PlaceCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card">
      {/* Image placeholder */}
      <div className="relative h-40 bg-muted flex items-center justify-center">
        <IconPhotoOff className="w-12 h-12 text-muted-foreground/30" />

        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Heart icon skeleton */}
      <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-muted/80 animate-pulse" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Badge skeleton */}
        <div className="w-16 h-5 bg-muted rounded-full animate-pulse" />

        {/* Title skeleton */}
        <div className="h-5 bg-muted rounded animate-pulse w-3/4" />

        {/* Location skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
        </div>
      </div>
    </div>
  )
}
