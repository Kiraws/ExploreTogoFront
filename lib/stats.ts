// lib/stats.ts
import type { Lieu } from "@/components/data-table"

export const hasImage = (l: Lieu) =>
  l.etabImages?.length && JSON.stringify(l.etabImages).includes("uploads")

export const hasGeometry = (l: Lieu) => !!l.geometry

export const countBy = <T, K extends PropertyKey>(
  arr: T[],
  keyFn: (item: T) => K
): Record<K, number> =>
  arr.reduce((acc, item) => {
    const key = keyFn(item)
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<K, number>)