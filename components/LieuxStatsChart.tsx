"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Lieu } from "@/components/data-table"

// Configuration du graphique avec un label ajusté
const chartConfig = {
  count: {
    label: "Nombre de lieux", // Supprime les espaces manuels, on gérera l'espacement ailleurs
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function LieuxStatsChart({ lieux }: { lieux: Lieu[] }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Calculer les données pour le graphique
  const filteredData = React.useMemo(() => {
    const referenceDate = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    // Filtrer les lieux par date
    const filteredLieux = lieux.filter((lieu) => {
      const createdAt = new Date(lieu.createdAt)
      return createdAt >= startDate
    })

    // Compter les lieux par type
    const typeCounts = filteredLieux.reduce((acc, lieu) => {
      acc[lieu.type] = (acc[lieu.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Transformer en format pour le graphique
    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
    }))
  }, [lieux, timeRange])

  // Calculer le total pour afficher dans le tooltip ou le titre
  const totalCount = filteredData.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Nombre de lieux par type (Total : {totalCount})</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Nombre de lieux pour les derniers {timeRange === "90d" ? "3 mois" : timeRange === "30d" ? "30 jours" : "7 jours"}
          </span>
          <span className="@[540px]/card:hidden">Derniers {timeRange === "90d" ? "3 mois" : timeRange === "30d" ? "30 jours" : "7 jours"}</span>
        </CardDescription>
        <CardAction>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
              aria-label="Select a time range"
            >
              <SelectValue placeholder="Derniers 3 mois" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Derniers 3 mois
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Derniers 30 jours
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Derniers 7 jours
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart data={filteredData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="type"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const translations: Record<string, string> = {
                  hotels: "Hôtels",
                  supermarches: "Supermarchés",
                  parcs: "Parcs & Jardins",
                  loisirs: "Loisirs",
                  marches: "Marchés",
                  sites: "Sites Naturels",
                  zones: "Zones Protégées",
                  touristique: "Touristique",
                }
                return translations[value] || value
              }}
            />
            <YAxis />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const translations: Record<string, string> = {
                      hotels: "Hôtels",
                      supermarches: "Supermarchés",
                      parcs: "Parcs & Jardins",
                      loisirs: "Loisirs",
                      marches: "Marchés",
                      sites: "Sites Naturels",
                      zones: "Zones Protégées",
                      touristique: "Touristique",
                    }
                    return translations[value] || value
                  }}
                  formatter={(value) => {
                    // Ajouter un espace entre le label et la valeur dans le tooltip
                    return [ `${chartConfig.count.label}: ${value}`]
                  }}
                  indicator="dot"
                />
              }
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}