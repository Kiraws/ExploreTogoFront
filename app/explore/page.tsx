"use client"

import { Heart } from "lucide-react"
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
  IconPhoto,
} from "@tabler/icons-react"
import type { Lieu } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  })[type] || type

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
  })[type] || "📍"

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
    const match = geom.match(/POINT\s*$$([^)]+)$$/)
    if (!match) return null
    const [lat, lng] = match[1].split(" ").map(Number)
    return [{ lat, lng }]
  }

  if (geom.startsWith("MULTIPOINT")) {
    const match = geom.match(/MULTIPOINT\s*$$(.+)$$/)
    if (!match) return null
    return match[1].split(",").map((coord) => {
      const [lat, lng] = coord.replace(/[()]/g, "").trim().split(" ").map(Number)
      return { lat, lng }
    })
  }

  if (geom.startsWith("LINESTRING")) {
    const match = geom.match(/LINESTRING\s*$$(.+)$$/)
    if (!match) return null
    return match[1].split(",").map((coord) => {
      const [lat, lng] = coord.trim().split(" ").map(Number)
      return { lat, lng }
    })
  }

  if (geom.startsWith("POLYGON")) {
    const match = geom.match(/POLYGON\s*$$\(.+}$$/)
    if (!match) return null
    return match[1].split(",").map((coord) => {
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

const truncateDescription = (text: string | undefined, maxLength = 30) => {
  if (!text) return ""
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text
}

// ===== COMPOSANTS =====

function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0)
  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-t-xl">
      <motion.div
        key={idx}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0"
      >
        <Image src={images[idx] || NO_IMAGE} alt={alt} fill className="object-cover" />
      </motion.div>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIdx((i) => (i - 1 + images.length) % images.length)
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 shadow-lg transition"
          >
            <IconChevronLeft className="size-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIdx((i) => (i + 1) % images.length)
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 shadow-lg transition"
          >
            <IconChevronRight className="size-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation()
                  setIdx(i)
                }}
                className={cn("h-1.5 rounded-full transition-all", i === idx ? "bg-white w-4" : "bg-white/60 w-1.5")}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function LocationCard({
  lieu,
  likedPlaces,
  onLikeToggle,
}: {
  lieu: Lieu
  likedPlaces: number[]
  onLikeToggle: (lieuId: number) => void
}) {
  const router = useRouter()
  const coords = extractCoordinates(lieu.geometry)
  const isLiked = likedPlaces.includes(Number(lieu.id))

  const images = normalizeImages(lieu.etabImages)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card
        className="overflow-hidden rounded-2xl border border-[#006A4E]/20 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={() => router.push(`/explore/${lieu.id}`)}
      >
        {/* Bouton Like avec animation */}
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation()
            onLikeToggle(Number(lieu.id))
          }}
          className="absolute top-3 right-3 z-10 bg-white/80 dark:bg-gray-900/80 text-red-500 p-2 rounded-full shadow-md transition"
        >
          <Heart className={`size-4 ${isLiked ? "fill-red-500" : ""}`} />
        </motion.button>

        {/* Image ou icône */}
        {hasValidImages(lieu) ? (
          <ImageCarousel images={images} alt={lieu.etabNom} />
        ) : (
          <div className="w-full aspect-video bg-gradient-to-br from-white to-[#006A4E]/10 dark:from-gray-800 dark:to-[#006A4E]/20 flex items-center justify-center rounded-t-2xl">
            <IconPhotoOff className="size-10 text-[#006A4E] dark:text-[#FFCE00]" />
          </div>
        )}

        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Badge className="bg-gradient-to-r from-[#006A4E] to-[#006A4E]/80 text-white border-0 text-xs">
              {getTypeIcon(lieu.type)} {translateType(lieu.type)}
            </Badge>
          </div>

          <h3 className="ffont-semibold text-base text-[#006A4E] dark:text-[#FFCE00] line-clamp-2 group-hover:text-[#006A4E]/80 dark:group-hover:text-[#FFCE00]/80 transition-colors">
            {lieu.etabNom}
          </h3>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <IconMapPin className="size-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">
              {[lieu.nomLocalite, lieu.cantonNom, lieu.communeNom].filter(Boolean).join(", ")}
            </span>
          </div>

          {lieu.description && (
            <p className="text-sm text-muted-foreground/80 line-clamp-1">{truncateDescription(lieu.description, 60)}</p>
          )}

          {coords && (
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2 bg-white/50 dark:bg-gray-800/50 border border-[#006A4E]/30 rounded-full hover:bg-[#006A4E]/10"
              onClick={(e) => {
                e.stopPropagation()
                const url = `https://www.google.com/maps/search/?api=1&query=${coords[0].lat},${coords[0].lng}`
                window.open(url, "_blank")
              }}
            >
              <IconMapPin className="size-4 mr-2 text-[#006A4E] dark:text-[#FFCE00]" />
              Voir sur la carte
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

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
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition">
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
              className="cursor-pointer hover:scale-105 transition"
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
  const [imageFilter, setImageFilter] = useState<"all" | "with" | "without">("all")

  const [page, setPage] = useState(1)
  const perPage = 12

  const [likedPlaces, setLikedPlaces] = useState<number[]>([])

  const handleLikeToggle = async (lieuId: number) => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Veuillez vous connecter pour aimer un lieu.")
      return
    }

    const isLiked = likedPlaces.includes(lieuId)
    const url = buildApiUrl(`/api/lieux/${lieuId}/likes`)
    const method = isLiked ? "DELETE" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (res.ok) {
        setLikedPlaces((prev) =>
          isLiked ? prev.filter((id) => id !== lieuId) : [...prev, lieuId]
        )

      } else {
        console.error("Erreur:", data.message || data)
      }
    } catch (err) {
      console.error("Erreur réseau:", err)
    }
  }

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

  // Charger les lieux likés
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const fetchLikedPlaces = async () => {
      try {
        const res = await fetch(buildApiUrl("/api/likes"), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Erreur lors du chargement des lieux likés")
        const data = await res.json()
        const likedIds = data.data.map((like: any) => Number(like.lieuId || like.id))
        setLikedPlaces(likedIds)
      } catch (err) {
        console.error("Erreur lors du chargement des lieux likés:", err)
      }
    }

    fetchLikedPlaces()
  }, [])

  // Options uniques
  const types = useMemo(() => [...new Set(lieux.map((l) => l.type))].sort(), [lieux])
  const regions = useMemo(() => [...new Set(lieux.map((l) => l.regionNom).filter(Boolean))].sort(), [lieux])
  const prefectures = useMemo(
    () =>
      [
        ...new Set(
          (selectedRegions.length > 0 ? lieux.filter((l) => selectedRegions.includes(l.regionNom)) : lieux)
            .map((l) => l.prefectureNom)
            .filter(Boolean),
        ),
      ].sort(),
    [lieux, selectedRegions],
  )
  const communes = useMemo(
    () =>
      [
        ...new Set(
          (selectedRegions.length > 0 ? lieux.filter((l) => selectedRegions.includes(l.regionNom)) : lieux)
            .filter((l) => (selectedPrefectures.length > 0 ? selectedPrefectures.includes(l.prefectureNom) : true))
            .map((l) => l.communeNom)
            .filter(Boolean),
        ),
      ].sort(),
    [lieux, selectedRegions, selectedPrefectures],
  )
  const cantons = useMemo(
    () =>
      [
        ...new Set(
          (selectedRegions.length > 0 ? lieux.filter((l) => selectedRegions.includes(l.regionNom)) : lieux)
            .filter((l) => (selectedPrefectures.length > 0 ? selectedPrefectures.includes(l.prefectureNom) : true))
            .filter((l) => (selectedCommunes.length > 0 ? selectedCommunes.includes(l.communeNom) : true))
            .map((l) => l.cantonNom)
            .filter(Boolean),
        ),
      ].sort(),
    [lieux, selectedRegions, selectedPrefectures, selectedCommunes],
  )
  const localites = useMemo(
    () =>
      [
        ...new Set(
          (selectedRegions.length > 0 ? lieux.filter((l) => selectedRegions.includes(l.regionNom)) : lieux)
            .filter((l) => (selectedPrefectures.length > 0 ? selectedPrefectures.includes(l.prefectureNom) : true))
            .filter((l) => (selectedCommunes.length > 0 ? selectedCommunes.includes(l.communeNom) : true))
            .filter((l) => (selectedCantons.length > 0 ? selectedCantons.includes(l.cantonNom) : true))
            .map((l) => l.nomLocalite)
            .filter(Boolean),
        ),
      ].sort(),
    [lieux, selectedRegions, selectedPrefectures, selectedCommunes, selectedCantons],
  )

  // Filter logic
  const filtered = useMemo(() => {
    let res = lieux
    if (search)
      res = res.filter(
        (l) =>
          l.etabNom.toLowerCase().includes(search.toLowerCase()) ||
          l.description?.toLowerCase().includes(search.toLowerCase()),
      )
    if (selectedTypes.length) res = res.filter((l) => selectedTypes.includes(l.type))
    if (selectedRegions.length) res = res.filter((l) => selectedRegions.includes(l.regionNom))
    if (selectedPrefectures.length) res = res.filter((l) => selectedPrefectures.includes(l.prefectureNom))
    if (selectedCommunes.length) res = res.filter((l) => selectedCommunes.includes(l.communeNom))
    if (selectedCantons.length) res = res.filter((l) => selectedCantons.includes(l.cantonNom))
    if (selectedLocalites.length) res = res.filter((l) => selectedLocalites.includes(l.nomLocalite))
    return res
  }, [
    search,
    selectedTypes,
    selectedRegions,
    selectedPrefectures,
    selectedCommunes,
    selectedCantons,
    selectedLocalites,
    lieux,
  ])

  const withImages = useMemo(() => filtered.filter(hasValidImages), [filtered])
  const withoutImages = useMemo(() => filtered.filter((l) => !hasValidImages(l)), [filtered])

  const filteredByImage = useMemo(() => {
    if (imageFilter === "with") return withImages
    if (imageFilter === "without") return withoutImages
    return filtered
  }, [filtered, withImages, withoutImages, imageFilter])

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
    return <div className="min-h-screen flex items-center justify-center text-destructive">Erreur : {error}</div>

  return (
    <div className="min-h-screen  dark:from-gray-900 dark:to-[#006A4E]/30 pt-24">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-[#006A4E]/20"
        >
          <h1 className="text-3xl font-bold text-[#006A4E] dark:text-[#FFCE00]">Explorer les lieux</h1>

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
                <Button variant="outline" className="rounded-full gap-2 bg-transparent">
                  <IconFilter className="size-4" />
                  Filtrer
                  {selectedRegions.length +
                    selectedPrefectures.length +
                    selectedCommunes.length +
                    selectedCantons.length +
                    selectedLocalites.length +
                    selectedTypes.length >
                    0 && (
                    <Badge className="ml-1">
                      {selectedRegions.length +
                        selectedPrefectures.length +
                        selectedCommunes.length +
                        selectedCantons.length +
                        selectedLocalites.length +
                        selectedTypes.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto overflow-x-hidden">
                <SheetHeader>
                  <SheetTitle>Filtrer les lieux</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  <CollapsibleFilter
                    title="Types"
                    options={types}
                    selected={selectedTypes}
                    onToggle={(v) => setSelectedTypes((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
                  />
                  <CollapsibleFilter
                    title="Régions"
                    options={regions}
                    selected={selectedRegions}
                    onToggle={(v) => setSelectedRegions((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
                  />
                  <CollapsibleFilter
                    title="Préfectures"
                    options={prefectures.filter(Boolean)}
                    selected={selectedPrefectures}
                    onToggle={(v) => setSelectedPrefectures((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
                  />
                  <CollapsibleFilter
                    title="Communes"
                    options={communes.filter(Boolean)}
                    selected={selectedCommunes}
                    onToggle={(v) => setSelectedCommunes((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
                  />
                  <CollapsibleFilter
                    title="Cantons"
                    options={cantons.filter(Boolean)}
                    selected={selectedCantons}
                    onToggle={(v) => setSelectedCantons((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
                  />
                  <CollapsibleFilter
                    title="Localités"
                    options={localites.filter(Boolean)}
                    selected={selectedLocalites}
                    onToggle={(v) => setSelectedLocalites((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
                  />
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
                      setImageFilter("all")
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

        <Tabs
  value={imageFilter}
  onValueChange={(v) => {
    setImageFilter(v as "all" | "with" | "without")
    setPage(1)
  }}
>
  <TabsList className="flex w-full max-w-2xl mx-auto gap-2 sm:gap-4 p-1 px-7  bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm border border-[#006A4E]/20">
    <TabsTrigger
      value="all"
      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm  data-[state=active]:bg-[#006A4E] data-[state=active]:text-white"
    >
      <span className="inline">Tous</span>
      <Badge variant="secondary" className="text-xs hidden sm:inline">
        {filtered.length}
      </Badge>
    </TabsTrigger>

    <TabsTrigger
      value="with"
      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm data-[state=active]:bg-[#006A4E] data-[state=active]:text-white"
    >
      <IconPhoto className="size-4" />
      <span className="hidden sm:inline">Avec images</span>
      <Badge variant="secondary" className=" text-xs ">
        {withImages.length}
      </Badge>
    </TabsTrigger>

    <TabsTrigger
      value="without"
      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm data-[state=active]:bg-[#006A4E] data-[state=active]:text-white"
    >
      <IconPhotoOff className="size-4" />
      <span className="hidden sm:inline">Sans images</span>
      <Badge variant="secondary" className="text-xs">
        {withoutImages.length}
      </Badge>
    </TabsTrigger>
  </TabsList>
</Tabs>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {paginated.map((lieu, idx) => (
              <motion.div
                key={lieu.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05 }}
              >
                <LocationCard
                  lieu={lieu}
                  likedPlaces={likedPlaces}
                  onLikeToggle={handleLikeToggle}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center gap-3 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-full px-6 py-3 shadow"
          >
            <Button
              variant="ghost"
              size="icon"
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
              variant="ghost"
              size="icon"
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