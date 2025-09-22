"use client"

import { useEffect, useState, useMemo } from "react"
import Image from "next/image"
import { buildApiUrl } from "@/lib/config"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  IconMapPin,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconChevronDown,
  IconX,
} from "@tabler/icons-react"
import type { Lieu } from "@/components/data-table"
import { NO_IMAGE } from "@/lib/images"

// ====================
// Traduction & icônes
// ====================
function translateType(type: string): string {
  const translations: Record<string, string> = {
    hotels: "Hotels",
    supermarches: "Supermarché/Mall",
    parcs: "Plages",
    loisirs: "Loisirs",
    marches: "Marchés",
    sites: "Sites Naturels",
    zones: "Zones Protégées",
    touristique: "Sites touristiques",
  }
  return translations[type] || type.charAt(0).toUpperCase() + type.slice(1)
}

function getTypeIcon(type: string) {
  switch (type) {
    case "hotels":
      return "🍽️"
    case "supermarches":
      return "🛒"
    case "loisirs":
      return "🎯"
    case "marches":
      return "🛍️"
    case "touristique":
    case "sites":
      return "🏛️"
    case "parcs":
      return "🏖️"
    case "zones":
      return "🌿"
    default:
      return "📍"
  }
}

// ====================
// Normalisation Images
// ====================
const reconstructImagePath = (image: string | Record<string, string>): string | null => {
  let path: string | null = null

  if (typeof image === "string") {
    path = image
  } else if (typeof image === "object" && image !== null) {
    path = Object.values(image).join("")
  }

  if (!path) return null

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  if (path.match(/^[A-Z]:\//i)) {
    const fileName = path.split(/[/\\]/).pop()
    return `http://localhost:3030/uploads/lieux/${fileName}`
  }

  return `/uploads/${path.replace(/^\/+/, "")}`
}

function normalizeImages(rawImages: (string | Record<string, string>)[] | undefined): string[] {
  if (!rawImages || rawImages.length === 0) return [NO_IMAGE]

  const processedImages = rawImages.map((img) => reconstructImagePath(img)).filter((img): img is string => img !== null)

  return processedImages.length > 0 ? processedImages : [NO_IMAGE]
}

// ====================
// Extraction coordonnées
// ====================
function extractCoordinates(geometry: string) {
  if (geometry.includes("POINT")) {
    const match = geometry.match(/POINT $$([^$$]+)\)/)
    if (match && match[1]) {
      const [lng, lat] = match[1].split(" ").map(Number)
      return { lat, lng }
    }
  }
  return null
}

// ====================
// Carousel d'images
// ====================
function ImageCarousel({ images, altText }: { images: string[]; altText: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
       <div className="relative h-48 w-full overflow-hidden">
        <Image src={NO_IMAGE || "/placeholder.svg"} alt="No image available" fill className="object-cover" />
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <Image
        src={images[0] || "/placeholder.svg"}
        alt={altText}
        width={300}
        height={200}
        className="w-full h-48 object-cover"
      />
    )
  }

  return (
    <div className="relative">
      <Image
        src={images[currentIndex] || "/placeholder.svg"}
        alt={`${altText} - Image ${currentIndex + 1}`}
        width={300}
        height={200}
        className="w-full h-48 object-cover"
      />
      <Button
        size="sm"
        variant="ghost"
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 h-8 w-8"
        onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
      >
        <IconChevronLeft className="size-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 h-8 w-8"
        onClick={() => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
      >
        <IconChevronRight className="size-4" />
      </Button>
    </div>
  )
}

// ====================
// Composant pour badges de filtres
// ====================
function FilterBadges({
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
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-gray-600 font-medium">{title}:</span>
      {options.map((option) => (
        <Badge
          key={option}
          variant={selected.includes(option) ? "default" : "outline"}
          className="cursor-pointer px-3 py-1 text-sm hover:bg-gray-100"
          onClick={() => onToggle(option)}
        >
          {option}
        </Badge>
      ))}
    </div>
  )
}

// ====================
// ====================
function CompactFilterDisplay({
  selectedTypes,
  selectedRegions,
  selectedPrefectures,
  selectedCommunes,
  selectedCantons,
  selectedLocalites,
  onRemoveFilter,
  onClearAll,
}: {
  selectedTypes: string[]
  selectedRegions: string[]
  selectedPrefectures: string[]
  selectedCommunes: string[]
  selectedCantons: string[]
  selectedLocalites: string[]
  onRemoveFilter: (type: string, value: string) => void
  onClearAll: () => void
}) {
  const allFilters = [
    ...selectedTypes.map((t) => ({ type: "type", value: t, label: translateType(t) })),
    ...selectedRegions.map((r) => ({ type: "region", value: r, label: r })),
    ...selectedPrefectures.map((p) => ({ type: "prefecture", value: p, label: p })),
    ...selectedCommunes.map((c) => ({ type: "commune", value: c, label: c })),
    ...selectedCantons.map((c) => ({ type: "canton", value: c, label: c })),
    ...selectedLocalites.map((l) => ({ type: "localite", value: l, label: l })),
  ]

  if (allFilters.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-gray-600 font-medium">Filtres actifs:</span>
      {allFilters.slice(0, 3).map((filter, index) => (
        <Badge key={`${filter.type}-${filter.value}`} variant="secondary" className="flex items-center gap-1 px-3 py-1">
          {filter.label}
          <IconX
            className="size-3 cursor-pointer hover:text-red-500"
            onClick={() => onRemoveFilter(filter.type, filter.value)}
          />
        </Badge>
      ))}
      {allFilters.length > 3 && (
        <Badge variant="outline" className="px-3 py-1">
          +{allFilters.length - 3} autres
        </Badge>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="text-red-500 hover:text-red-700 px-2 py-1 h-auto"
      >
        Tout effacer
      </Button>
    </div>
  )
}

// ====================
// ====================
function CollapsibleFilterSection({
  title,
  options,
  selected,
  onToggle,
  searchable = false,
}: {
  title: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
  searchable?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAll, setShowAll] = useState(false)

  const filteredOptions = searchable
    ? options.filter((option) => option.toLowerCase().includes(searchQuery.toLowerCase()))
    : options

  const displayOptions = showAll ? filteredOptions : filteredOptions.slice(0, 8)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="font-medium">{title}</span>
          {selected.length > 0 && (
            <Badge variant="default" className="text-xs">
              {selected.length}
            </Badge>
          )}
        </div>
        <IconChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">
        {searchable && options.length > 10 && (
          <div className="mb-3">
            <Input
              placeholder={`Rechercher dans ${title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {displayOptions.map((option) => (
            <Badge
              key={option}
              variant={selected.includes(option) ? "default" : "outline"}
              className="cursor-pointer px-3 py-1 text-sm hover:bg-gray-100"
              onClick={() => onToggle(option)}
            >
              {option}
            </Badge>
          ))}
        </div>
        {filteredOptions.length > 8 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            {showAll ? "Voir moins" : `Voir ${filteredOptions.length - 8} de plus`}
          </Button>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

// ====================
// Page principale
// ====================
export default function LieuxPage() {
  const [lieux, setLieux] = useState<Lieu[]>([])
  const [filteredLieux, setFilteredLieux] = useState<Lieu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>([])
  const [selectedCommunes, setSelectedCommunes] = useState<string[]>([])
  const [selectedCantons, setSelectedCantons] = useState<string[]>([])
  const [selectedLocalites, setSelectedLocalites] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const itemsPerPage = 12

  // Récupération des lieux
  useEffect(() => {
    const fetchLieux = async () => {
      try {
        const response = await fetch(buildApiUrl("/api/lieux"), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        })
        if (!response.ok) throw new Error(`Erreur ${response.status}`)
        const result = await response.json()
        if (result.success) {
          setLieux(result.data)
          setFilteredLieux(result.data)
        } else {
          throw new Error(result.message || "Erreur lors de la récupération")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
      } finally {
        setLoading(false)
      }
    }
    fetchLieux()
  }, [])

  // Calcul des options uniques
  const uniqueTypes = useMemo(() => [...new Set(lieux.map((lieu) => lieu.type))].sort(), [lieux])
  const uniqueRegions = useMemo(
    () => [...new Set(lieux.map((lieu) => lieu.regionNom).filter((v): v is string => !!v))].sort(),
    [lieux],
  )
  const uniquePrefectures = useMemo(() => {
    const filtered =
      selectedRegions.length > 0
        ? lieux.filter((l) => selectedRegions.includes(l.regionNom)).map((l) => l.prefectureNom)
        : lieux.map((l) => l.prefectureNom)
    return [...new Set(filtered.filter((v): v is string => !!v))].sort()
  }, [lieux, selectedRegions])
  const uniqueCommunes = useMemo(() => {
    let filtered = lieux
    if (selectedRegions.length > 0) filtered = filtered.filter((l) => selectedRegions.includes(l.regionNom))
    if (selectedPrefectures.length > 0) filtered = filtered.filter((l) => selectedPrefectures.includes(l.prefectureNom))
    return [...new Set(filtered.map((l) => l.communeNom).filter((v): v is string => !!v))].sort()
  }, [lieux, selectedRegions, selectedPrefectures])
  const uniqueCantons = useMemo(() => {
    let filtered = lieux
    if (selectedRegions.length > 0) filtered = filtered.filter((l) => selectedRegions.includes(l.regionNom))
    if (selectedPrefectures.length > 0) filtered = filtered.filter((l) => selectedPrefectures.includes(l.prefectureNom))
    if (selectedCommunes.length > 0) filtered = filtered.filter((l) => selectedCommunes.includes(l.communeNom))
    return [...new Set(filtered.map((l) => l.cantonNom).filter((v): v is string => !!v))].sort()
  }, [lieux, selectedRegions, selectedPrefectures, selectedCommunes])
  const uniqueLocalites = useMemo(() => {
    let filtered = lieux
    if (selectedRegions.length > 0) filtered = filtered.filter((l) => selectedRegions.includes(l.regionNom))
    if (selectedPrefectures.length > 0) filtered = filtered.filter((l) => selectedPrefectures.includes(l.prefectureNom))
    if (selectedCommunes.length > 0) filtered = filtered.filter((l) => selectedCommunes.includes(l.communeNom))
    if (selectedCantons.length > 0) filtered = filtered.filter((l) => selectedCantons.includes(l.cantonNom))
    return [...new Set(filtered.map((l) => l.nomLocalite).filter((v): v is string => !!v))].sort()
  }, [lieux, selectedRegions, selectedPrefectures, selectedCommunes, selectedCantons])

  // Filtrage
  const filtered = useMemo(() => {
    let result = lieux
    const lowerQuery = searchQuery.toLowerCase()
    if (searchQuery) {
      result = result.filter(
        (lieu) =>
          lieu.etabNom.toLowerCase().includes(lowerQuery) ||
          (lieu.description && lieu.description.toLowerCase().includes(lowerQuery)) ||
          (lieu.etabAdresse && lieu.etabAdresse.toLowerCase().includes(lowerQuery)),
      )
    }
    if (selectedTypes.length > 0) result = result.filter((lieu) => selectedTypes.includes(lieu.type))
    if (selectedRegions.length > 0)
      result = result.filter((lieu) => lieu.regionNom && selectedRegions.includes(lieu.regionNom))
    if (selectedPrefectures.length > 0)
      result = result.filter((lieu) => lieu.prefectureNom && selectedPrefectures.includes(lieu.prefectureNom))
    if (selectedCommunes.length > 0)
      result = result.filter((lieu) => lieu.communeNom && selectedCommunes.includes(lieu.communeNom))
    if (selectedCantons.length > 0)
      result = result.filter((lieu) => lieu.cantonNom && selectedCantons.includes(lieu.cantonNom))
    if (selectedLocalites.length > 0)
      result = result.filter((lieu) => lieu.nomLocalite && selectedLocalites.includes(lieu.nomLocalite))
    return result
  }, [
    lieux,
    searchQuery,
    selectedTypes,
    selectedRegions,
    selectedPrefectures,
    selectedCommunes,
    selectedCantons,
    selectedLocalites,
  ])

  useEffect(() => {
    setFilteredLieux(filtered)
    setPage(1)
  }, [filtered])

  // Pagination
  const paginatedLieux = filteredLieux.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const totalPages = Math.ceil(filteredLieux.length / itemsPerPage)

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) => (prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]))
  }

  const togglePrefecture = (pref: string) => {
    setSelectedPrefectures((prev) => (prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]))
  }

  const toggleCommune = (comm: string) => {
    setSelectedCommunes((prev) => (prev.includes(comm) ? prev.filter((c) => c !== comm) : [...prev, comm]))
  }

  const toggleCanton = (cant: string) => {
    setSelectedCantons((prev) => (prev.includes(cant) ? prev.filter((c) => c !== cant) : [...prev, cant]))
  }

  const toggleLocalite = (loc: string) => {
    setSelectedLocalites((prev) => (prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]))
  }

  const resetAllFilters = () => {
    setSelectedTypes([])
    setSelectedRegions([])
    setSelectedPrefectures([])
    setSelectedCommunes([])
    setSelectedCantons([])
    setSelectedLocalites([])
    setSearchQuery("")
  }

  // ====================
  // ====================
  const removeFilter = (type: string, value: string) => {
    switch (type) {
      case "type":
        setSelectedTypes((prev) => prev.filter((t) => t !== value))
        break
      case "region":
        setSelectedRegions((prev) => prev.filter((r) => r !== value))
        break
      case "prefecture":
        setSelectedPrefectures((prev) => prev.filter((p) => p !== value))
        break
      case "commune":
        setSelectedCommunes((prev) => prev.filter((c) => c !== value))
        break
      case "canton":
        setSelectedCantons((prev) => prev.filter((c) => c !== value))
        break
      case "localite":
        setSelectedLocalites((prev) => prev.filter((l) => l !== value))
        break
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center">Chargement des lieux...</div>
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">Erreur : {error}</div>

  return (
    <div className="min-h-screen bg-gray-50 mt-24">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2  pb-2">
            <Button
              variant={selectedTypes.length === 0 ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedTypes([])}
              className="rounded-full px-4 py-2 flex-shrink-0"
            >
              🏠 Tous
              <Badge variant="secondary" className="ml-2">
                {filteredLieux.length}
              </Badge>
            </Button>
            {uniqueTypes.map((type) => (
              <Button
                key={type}
                variant={selectedTypes.includes(type) ? "default" : "ghost"}
                size="sm"
                onClick={() => toggleType(type)}
                className="rounded-full px-4 py-2 flex-shrink-0"
              >
                {getTypeIcon(type)} {translateType(type)}
              </Button>
            ))}
          </nav>

          <div className="mt-4 flex gap-3 items-center">
            <div className="relative flex-1 max-w-md">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                type="text"
                placeholder="Rechercher un lieu, une description ou une adresse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </Button>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 px-4 py-2 rounded-full bg-transparent">
                  <IconFilter className="size-4" />
                  Filtres
                  {selectedRegions.length +
                    selectedPrefectures.length +
                    selectedCommunes.length +
                    selectedCantons.length +
                    selectedLocalites.length >
                    0 && (
                    <Badge variant="default" className="text-xs">
                      {selectedRegions.length +
                        selectedPrefectures.length +
                        selectedCommunes.length +
                        selectedCantons.length +
                        selectedLocalites.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto ">
                <SheetHeader>
                  <SheetTitle>Filtrer par localisation</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-1">
                  <CollapsibleFilterSection
                    title="Régions"
                    options={uniqueRegions}
                    selected={selectedRegions}
                    onToggle={toggleRegion}
                    searchable={uniqueRegions.length > 10}
                  />
                  <CollapsibleFilterSection
                    title="Préfectures"
                    options={uniquePrefectures}
                    selected={selectedPrefectures}
                    onToggle={togglePrefecture}
                    searchable={uniquePrefectures.length > 10}
                  />
                  <CollapsibleFilterSection
                    title="Communes"
                    options={uniqueCommunes}
                    selected={selectedCommunes}
                    onToggle={toggleCommune}
                    searchable={uniqueCommunes.length > 10}
                  />
                  <CollapsibleFilterSection
                    title="Cantons"
                    options={uniqueCantons}
                    selected={selectedCantons}
                    onToggle={toggleCanton}
                    searchable={uniqueCantons.length > 10}
                  />
                  <CollapsibleFilterSection
                    title="Localités"
                    options={uniqueLocalites}
                    selected={selectedLocalites}
                    onToggle={toggleLocalite}
                    searchable={true}
                  />
                </div>
                <div className="m-6 pt-4 border-t">
                  <Button variant="outline" onClick={resetAllFilters} className="w-full bg-transparent">
                    Réinitialiser tous les filtres
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="mt-4">
            <CompactFilterDisplay
              selectedTypes={selectedTypes}
              selectedRegions={selectedRegions}
              selectedPrefectures={selectedPrefectures}
              selectedCommunes={selectedCommunes}
              selectedCantons={selectedCantons}
              selectedLocalites={selectedLocalites}
              onRemoveFilter={removeFilter}
              onClearAll={resetAllFilters}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedLieux.map((lieu) => {
            const coordinates = extractCoordinates(lieu.geometry)
            const images = normalizeImages(lieu.etabImages)

            return (
           <Card
                key={lieu.id}
                className="overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <ImageCarousel images={images} altText={lieu.etabNom} />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800 px-3 py-1 rounded-full shadow-sm">
                      {getTypeIcon(lieu.type)} {translateType(lieu.type)}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{lieu.etabNom}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <IconMapPin className="size-4 mr-1 text-gray-400" />
                    <span className="line-clamp-1">
                      {[lieu.nomLocalite, lieu.cantonNom, lieu.communeNom, lieu.prefectureNom, lieu.regionNom]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                  {lieu.description && <p className="text-sm text-gray-600 line-clamp-2">{lieu.description}</p>}
                  {coordinates && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`,
                          "_blank",
                        )
                      }
                    >
                      <IconMapPin className="size-4 mr-2" /> Voir sur la carte
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4">
              Précédent
            </Button>
            <div className="flex items-center px-4 py-2 text-sm text-gray-600">
              Page {page} sur {totalPages}
            </div>
            <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4">
              Suivant
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
