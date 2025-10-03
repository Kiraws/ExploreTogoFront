"use client"

import { useEffect, useState, useMemo } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  IconMapPin,
  IconSearch,
  IconFilter,
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconChevronDown,
  IconPhotoOff,
} from "@tabler/icons-react"
import type { Lieu } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { buildApiUrl } from "@/lib/config"
import { NO_IMAGE } from "@/lib/images"
import { cn } from "@/lib/utils"

// ===== UTILITAIRES =====
const translateType = (type: string) =>
  ({
    hotels: "Hôtels",
    supermarches: "Supermarchés",
    parcs: "Parcs & Jardins",
    loisirs: "Loisirs",
    marches: "Marchés",
    sites: "Sites Naturels",
    zones: "Zones Protégées",
    touristique: "Sites Touristiques",
  }[type] || type)

const getTypeIcon = (type: string) =>
  ({
    hotels: "🍽️",
    supermarches: "🛒",
    loisirs: "🎯",
    marches: "🛍️",
    touristique: "🏛️",
    sites: "🏛️",
    parcs: "🏖️",
    zones: "🌿",
  }[type] || "📍")

const reconstructImagePath = (img: unknown): string | null => {
  const path = typeof img === "string" ? img : Object.values((img as Record<string, string>) || {}).join("")
  if (!path) return null
  if (path.startsWith("http")) return path
  const fileName = path.split(/[/\\]/).pop()
  return `http://localhost:3030/uploads/lieux/${fileName}`
}

const normalizeImages = (raw: unknown[]): string[] => {
  if (!raw?.length) return [NO_IMAGE]
  const imgs = raw.map(reconstructImagePath).filter((v): v is string => !!v)
  return imgs.length ? imgs : [NO_IMAGE]
}

type Coordinate = { lat: number; lng: number }

const extractCoordinates = (geometry: string): Coordinate[] | null => {
  if (!geometry) return null
  const geom = geometry.replace(/^SRID=\d+;/, "").trim()

  if (geom.startsWith("POINT")) {
    const match = geom.match(/POINT\s*\(([^)]+)\)/)
    if (!match) return null
    // ⚠️ Tes données sont stockées « lat lng » → on inverse
    const [lat, lng] = match[1].split(" ").map(Number)
    return [{ lat, lng }] // ✅ bon ordre pour Google
  }

  // MULTIPOINT, LINESTRING, POLYGON : même logique
  if (geom.startsWith("MULTIPOINT")) {
    const match = geom.match(/MULTIPOINT\s*\((.+)\)/)
    if (!match) return null
    return match[1]
      .split(",")
      .map(coord => {
        const [lat, lng] = coord.replace(/[()]/g, "").trim().split(" ").map(Number)
        return { lat, lng }
      })
  }

  if (geom.startsWith("LINESTRING")) {
    const match = geom.match(/LINESTRING\s*\((.+)\)/)
    if (!match) return null
    return match[1]
      .split(",")
      .map(coord => {
        const [lat, lng] = coord.trim().split(" ").map(Number)
        return { lat, lng }
      })
  }

  if (geom.startsWith("POLYGON")) {
    const match = geom.match(/POLYGON\s*\(\((.+)\)\)/)
    if (!match) return null
    return match[1]
      .split(",")
      .map(coord => {
        const [lat, lng] = coord.trim().split(" ").map(Number)
        return { lat, lng }
      })
  }

  return null
}

const hasValidImages = (lieu: Lieu) => {
  const images = normalizeImages(lieu.etabImages)
  return images.length > 0 && !images.includes(NO_IMAGE)
}

// ===== COMPOSANTS DE CARDS =====

function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0)
  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          <Image src={images[idx] || NO_IMAGE} alt={alt} fill className="object-cover" />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow-md transition"
          >
            <IconChevronLeft className="size-5" />
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % images.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow-md transition"
          >
            <IconChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === idx ? "bg-white w-6" : "bg-white/50 w-2"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function LocationCardWithImage({ lieu }: { lieu: Lieu }) {
  const router = useRouter()
  const coords = extractCoordinates(lieu.geometry)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <Card
        className="overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        onClick={() => router.push(`/explore/${lieu.id}`)}
      >
        <ImageCarousel images={normalizeImages(lieu.etabImages)} alt={lieu.etabNom} />

        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {getTypeIcon(lieu.type)} {translateType(lieu.type)}
            </Badge>
            <span className="text-xs text-muted-foreground">{lieu.status ? "Actif" : "Inactif"}</span>
          </div>

          <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2">{lieu.etabNom}</h3>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <IconMapPin className="size-4 mt-0.5" />
            <span className="line-clamp-2">
              {[lieu.nomLocalite, lieu.cantonNom, lieu.communeNom, lieu.prefectureNom, lieu.regionNom]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>

          {lieu.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{lieu.description}</p>
          )}

{coords && (
  <>
    
    <Button
      size="sm"
      variant="outline"
      className="w-full rounded-full"
      onClick={(e) => {
        e.stopPropagation()
        const url = `https://www.google.com/maps/search/?api=1&query=${coords[0].lat},${coords[0].lng}`
        console.log("Maps URL:", url)
        window.open(url, "_blank")
      }}
    >
      <IconMapPin className="size-4 mr-2" />
      Voir sur la carte
    </Button>
  </>
)}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ... le reste du fichier reste identique (LocationCardWithoutImage, filtres, page principale, pagination, etc.)

function LocationCardWithoutImage({ lieu }: { lieu: Lieu }) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <Card
        className="rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 flex items-center gap-4"
        onClick={() => router.push(`/explore/${lieu.id}`)}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
          <IconPhotoOff className="w-6 h-6 text-gray-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <Badge variant="outline" className="text-xs">
              {getTypeIcon(lieu.type)} {translateType(lieu.type)}
            </Badge>
            <span className="text-xs text-muted-foreground">{lieu.status ? "Actif" : "Inactif"}</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{lieu.etabNom}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {[lieu.nomLocalite, lieu.cantonNom, lieu.communeNom, lieu.prefectureNom, lieu.regionNom]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      </Card>
    </motion.div>
  )
}

function LocationCard({ lieu }: { lieu: Lieu }) {
  return hasValidImages(lieu) ? (
    <LocationCardWithImage lieu={lieu} />
  ) : (
    <LocationCardWithoutImage lieu={lieu} />
  )
}

// ===== FILTRES =====

function CollapsibleFilter({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <span className="font-medium">{title}</span>
          {selected.length > 0 && <Badge className="text-xs">{selected.length}</Badge>}
        </div>
        <IconChevronDown className={cn("size-4 transition", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <Badge
              key={opt}
              variant={selected.includes(opt) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onToggle(opt)}
            >
              {opt}
            </Badge>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// ===== PAGE PRINCIPALE =====

export default function LieuxPage() {
  const [lieux, setLieux] = useState<Lieu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>([])
  const [selectedCommunes, setSelectedCommunes] = useState<string[]>([])
  const [selectedCantons, setSelectedCantons] = useState<string[]>([])
  const [selectedLocalites, setSelectedLocalites] = useState<string[]>([])
  const [imageFilter, setImageFilter] = useState<"with" | "without" | null>(null)

  const [page, setPage] = useState(1)
  const perPage = 12

  // Fetch data
  useEffect(() => {
    fetch(buildApiUrl("/api/lieux"), {
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setLieux(d.data)
        } else throw new Error(d.message)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Options uniques
  const types = useMemo(() => [...new Set(lieux.map((l) => l.type))].sort(), [lieux])
  const regions = useMemo(() => [...new Set(lieux.map((l) => l.regionNom).filter(Boolean))].sort(), [lieux])
  const prefectures = useMemo(
    () =>
      [
        ...new Set(
          (selectedRegions.length > 0
            ? lieux.filter((l) => selectedRegions.includes(l.regionNom))
            : lieux
          )
            .map((l) => l.prefectureNom)
            .filter(Boolean)
        ),
      ].sort(),
    [lieux, selectedRegions]
  )
  const communes = useMemo(
    () =>
      [
        ...new Set(
          (selectedRegions.length > 0
            ? lieux.filter((l) => selectedRegions.includes(l.regionNom))
            : lieux
          )
            .filter((l) => (selectedPrefectures.length > 0 ? selectedPrefectures.includes(l.prefectureNom) : true))
            .map((l) => l.communeNom)
            .filter(Boolean)
        ),
      ].sort(),
    [lieux, selectedRegions, selectedPrefectures]
  )
  const cantons = useMemo(
    () =>
      [
        ...new Set(
          (selectedRegions.length > 0
            ? lieux.filter((l) => selectedRegions.includes(l.regionNom))
            : lieux
          )
            .filter((l) => (selectedPrefectures.length > 0 ? selectedPrefectures.includes(l.prefectureNom) : true))
            .filter((l) => (selectedCommunes.length > 0 ? selectedCommunes.includes(l.communeNom) : true))
            .map((l) => l.cantonNom)
            .filter(Boolean)
        ),
      ].sort(),
    [lieux, selectedRegions, selectedPrefectures, selectedCommunes]
  )
  const localites = useMemo(
    () =>
      [
        ...new Set(
          (selectedRegions.length > 0
            ? lieux.filter((l) => selectedRegions.includes(l.regionNom))
            : lieux
          )
            .filter((l) => (selectedPrefectures.length > 0 ? selectedPrefectures.includes(l.prefectureNom) : true))
            .filter((l) => (selectedCommunes.length > 0 ? selectedCommunes.includes(l.communeNom) : true))
            .filter((l) => (selectedCantons.length > 0 ? selectedCantons.includes(l.cantonNom) : true))
            .map((l) => l.nomLocalite)
            .filter(Boolean)
        ),
      ].sort(),
    [lieux, selectedRegions, selectedPrefectures, selectedCommunes, selectedCantons]
  )

  // Filter logic
  const filtered = useMemo(() => {
    let res = lieux
    if (search)
      res = res.filter(
        (l) =>
          l.etabNom.toLowerCase().includes(search.toLowerCase()) ||
          l.description?.toLowerCase().includes(search.toLowerCase())
      )
    if (selectedTypes.length) res = res.filter((l) => selectedTypes.includes(l.type))
    if (selectedRegions.length) res = res.filter((l) => selectedRegions.includes(l.regionNom))
    if (selectedPrefectures.length) res = res.filter((l) => selectedPrefectures.includes(l.prefectureNom))
    if (selectedCommunes.length) res = res.filter((l) => selectedCommunes.includes(l.communeNom))
    if (selectedCantons.length) res = res.filter((l) => selectedCantons.includes(l.cantonNom))
    if (selectedLocalites.length) res = res.filter((l) => selectedLocalites.includes(l.nomLocalite))
    return res
  }, [search, selectedTypes, selectedRegions, selectedPrefectures, selectedCommunes, selectedCantons, selectedLocalites, lieux])

  const withImages = useMemo(() => filtered.filter(hasValidImages), [filtered])
  const withoutImages = useMemo(() => filtered.filter((l) => !hasValidImages(l)), [filtered])

  const filteredByImage = useMemo(() => {
    if (imageFilter === "with") return withImages
    if (imageFilter === "without") return withoutImages
    return filtered
  }, [filtered, imageFilter])

  const paginated = useMemo(() => {
    return filteredByImage.slice((page - 1) * perPage, page * perPage)
  }, [filteredByImage, page])

  const totalPages = Math.ceil(filteredByImage.length / perPage)

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Chargement…</div>
      </div>
    )
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-destructive">
        Erreur : {error}
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-24">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header animé */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <h1 className="text-3xl font-bold">Explorer les lieux</h1>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher un lieu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-full"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <IconX className="size-4" />
                </button>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-full gap-2">
                  <IconFilter className="size-4" />
                  Filtrer
                  {(selectedRegions.length + selectedPrefectures.length + selectedCommunes.length + selectedCantons.length + selectedLocalites.length + selectedTypes.length) > 0 && (
                    <Badge className="ml-1">
                      {selectedRegions.length + selectedPrefectures.length + selectedCommunes.length + selectedCantons.length + selectedLocalites.length + selectedTypes.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto overflow-x-hidden">
                <SheetHeader>
                  <SheetTitle>Filtrer les lieux</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  <CollapsibleFilter title="Types" options={types} selected={selectedTypes} onToggle={(v) => setSelectedTypes((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))} />
                  <CollapsibleFilter title="Régions" options={regions} selected={selectedRegions} onToggle={(v) => setSelectedRegions((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))} />
                  <CollapsibleFilter title="Préfectures" options={prefectures.filter(Boolean)} selected={selectedPrefectures} onToggle={(v) => setSelectedPrefectures((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))} />
                  <CollapsibleFilter title="Communes" options={communes.filter(Boolean)} selected={selectedCommunes} onToggle={(v) => setSelectedCommunes((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))} />
                  <CollapsibleFilter title="Cantons" options={cantons.filter(Boolean)} selected={selectedCantons} onToggle={(v) => setSelectedCantons((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))} />
                  <CollapsibleFilter title="Localités" options={localites.filter(Boolean)} selected={selectedLocalites} onToggle={(v) => setSelectedLocalites((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))} />
                </div>
                <div className="m-6">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setSelectedTypes([])
                      setSelectedRegions([])
                      setSelectedPrefectures([])
                      setSelectedCommunes([])
                      setSelectedCantons([])
                      setSelectedLocalites([])
                      setSearch("")
                      setImageFilter(null)
                      setPage(1)
                    }}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </motion.div>

        {/* Boutons de filtre image */}
        <div className="flex items-center gap-3">
          {withImages.length > 0 && (
            <Button
              size="sm"
              variant={imageFilter === "with" ? "default" : "outline"}
              onClick={() => {
                setImageFilter(imageFilter === "with" ? null : "with")
                setPage(1)
              }}
            >
              Avec images {imageFilter === "with" && `(${withImages.length})`}
            </Button>
          )}
          {withoutImages.length > 0 && (
            <Button
              size="sm"
              variant={imageFilter === "without" ? "default" : "outline"}
              onClick={() => {
                setImageFilter(imageFilter === "without" ? null : "without")
                setPage(1)
              }}
            >
              Sans images {imageFilter === "without" && `(${withoutImages.length})`}
            </Button>
          )}
        </div>

        {/* Grille animée */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {paginated.map((lieu) => (
              <LocationCard key={lieu.id} lieu={lieu} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center gap-3"
          >
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="rounded-full"
            >
              <IconChevronLeft className="size-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} sur {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-full"
            >
              <IconChevronRight className="size-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}