"use client"

import { useState } from "react"

const REGIONS = [
  { id: "maritime", name: "Maritime", color: "#0ea5e9" },
  { id: "plateaux", name: "Plateaux", color: "#10b981" },
  { id: "centrale", name: "Centrale", color: "#f59e0b" },
  { id: "kara", name: "Kara", color: "#8b5cf6" },
  { id: "savanes", name: "Savanes", color: "#ef4444" },
]
import { motion } from "framer-motion"


// Même contour que ton image, mais en SVG pur
const OUTLINE =
  "M215,320 L260,280 L310,300 L300,350 L250,370 Z " +
  "M300,250 L380,240 L400,300 L360,340 L300,320 Z " +
  "M280,180 L340,170 L360,220 L320,240 L270,220 Z " +
  "M320,100 L400,90 L420,150 L380,170 L310,160 Z " +
  "M380,50 L480,40 L500,120 L440,140 L360,130 Z"

export default function TogoFullMap() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="w-full h-full max-w-4xl mx-auto">
      <div className="relative bg-gradient-to-br from-sky-50 to-background rounded-2xl p-4 shadow-lg">
        <svg
          viewBox="0 0 600 450"
          className="w-full h-auto drop-shadow-md"
        >
          {/* Fond neutre très clair */}
          <rect width="600" height="450" className="fill-muted/30" rx="16" />

          {/* Contour global du Togo */}
          <path
            d={OUTLINE}
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth="2"
            className="opacity-60"
          />

          {/* Régions colorées */}
          {REGIONS.map((r) => (
            <g key={r.id}>
              <path
                d={OUTLINE}
                fill={hovered === r.id ? r.color : `${r.color}80`}
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-all cursor-pointer"
                onMouseEnter={() => setHovered(r.id)}
                onMouseLeave={() => setHovered(null)}
              />
              {/* Label centré */}
              {hovered === r.id && (
                <text
                  x="300"
                  y="225"
                  textAnchor="middle"
                  className="fill-foreground text-2xl font-bold drop-shadow-md"
                >
                  {r.name}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* Bouton vers carte interactive */}
        <div className="mt-4 flex justify-center">
          <a href="/carte">
            <Button size="sm" variant="outline">
              Voir la carte interactive
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}