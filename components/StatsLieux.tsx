// components/StatsLieux.tsx
"use client"
import { useMemo } from "react"
import { useLieux } from "@/lib/useLieux"
import {  hasGeometry, countBy } from "@/lib/stats"
import { Bar } from "@/components/ui/horizontal-bar"   // simple barre 100 % CSS
import { IconPhoto, IconMapPin } from "@tabler/icons-react" 
import { hasValidImages } from "@/lib/images" // même fichier

export default function StatsLieux() {
  const { lieux, loading } = useLieux()

  const stats = useMemo(() => {
    const total = lieux.length
    const withImg = lieux.filter(hasValidImages).length
    const withGeo = lieux.filter(hasGeometry).length
    const byType = countBy(lieux, (l) => l.type)
    const byRegion = countBy(lieux, (l) => l.regionNom || "Non renseigné")

    const topRegions = Object.entries(byRegion)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    return { total, withImg, withGeo, byType, topRegions }
  }, [lieux])

  if (loading) return null // ou un petit skeleton

  return (
    <section className="container mx-auto px-6 py-16">
      <h3 className="text-3xl font-bold text-[#006A4E] dark:text-[#FFCE00] mb-8 text-center">
        Chiffres clés
      </h3>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/30 backdrop-blur-sm shadow border border-white/30">
          <div className="text-4xl font-extrabold text-[#006A4E] dark:text-[#FFCE00]">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Lieux référencés</div>
        </div>

        {/* Avec / sans images */}
        <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/30 backdrop-blur-sm shadow border border-white/30">
          <div className="flex items-center gap-3 mb-2">
            <IconPhoto className="size-5 text-green-600" />
            <span className="text-2xl font-bold">{stats.withImg}</span>
          </div>
          <div className="text-sm text-muted-foreground">Avec images</div>
         {/*
          <div className="mt-2 text-xs text-muted-foreground">
            {Math.round((stats.withImg / stats.total) * 100)} %
          </div>
         */} 
        </div>

        {/* Géolocalisés */}
        <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/30 backdrop-blur-sm shadow border border-white/30">
          <div className="flex items-center gap-3 mb-2">
            <IconMapPin className="size-5 text-blue-600" />
            <span className="text-2xl font-bold">{stats.withGeo}</span>
          </div>
          <div className="text-sm text-muted-foreground">Géolocalisés</div>
          <div className="mt-2 text-xs text-muted-foreground">
            {Math.round((stats.withGeo / stats.total) * 100)} %
          </div>
        </div>

        {/* Top régions */}
        <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/30 backdrop-blur-sm shadow border border-white/30">
          <div className="text-sm font-semibold mb-3">Top régions</div>
          <ul className="space-y-2 text-sm">
            {stats.topRegions.map(([name, q]) => (
              <li key={name} className="flex justify-between">
                <span className="text-muted-foreground">{name}</span>
                <span className="font-semibold">{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Barres horizontales par type */}
      <div className="mt-10 p-6 rounded-2xl bg-white/60 dark:bg-gray-800/30 backdrop-blur-sm shadow border border-white/30">
        <div className="text-sm font-semibold mb-4">Répartition par catégorie</div>
        <div className="space-y-3">
          {Object.entries(stats.byType)
            .sort(([, a], [, b]) => b - a)
            .map(([type, qty]) => (
              <div key={type} className="flex items-center gap-3">
                <span className="w-20 text-xs text-muted-foreground">{type}</span>
                <Bar value={qty} max={stats.total} className="flex-1" />
                <span className="w-10 text-right text-xs font-semibold">{qty}</span>
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}