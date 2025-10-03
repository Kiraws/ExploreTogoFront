"use client"

import { useEffect, useState, useMemo } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useRouter, useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  IconMapPin,
  IconArrowLeft,
  IconInfoCircle,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconNavigation,
  IconPhone,
  IconShare,
  IconBookmark,
  IconSun,
  IconMoon,
} from "@tabler/icons-react"

import { buildApiUrl } from "@/lib/config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Lieu } from "@/components/data-table"
import { NO_IMAGE } from "@/lib/images"
import {
  normalizeImages,
  extractCoordinates,
  getTypeIcon,
  translateType,
} from "../utils"

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Chargement de la carte...</p>
    </div>
  ),
})

const fieldsByType = {
  loisirs: ["regionNom", "prefectureNom", "communeNom", "cantonNom", "etabNom", "description", "etabJour", "type", "etablissement_type"],
  hotels: ["regionNom", "prefectureNom", "communeNom", "cantonNom", "nomLocalite", "etabNom", "description", "toiletteType", "type"],
  parcs: ["regionNom", "prefectureNom", "communeNom", "cantonNom", "nomLocalite", "etabNom", "etabAdresse", "description", "etabJour", "toiletteType", "type", "activiteStatut", "activiteCategorie","terrain"],
  marches: ["regionNom", "prefectureNom", "communeNom", "cantonNom", "nomLocalite", "etabNom", "description", "etabJour", "type", "organisme"],
  sites: ["regionNom", "prefectureNom", "communeNom", "cantonNom", "nomLocalite", "etabNom", "etabAdresse", "description", "etabJour", "type", "typeSiteDeux", "ministereTutelle", "religion"],
  zones: ["regionNom", "prefectureNom", "communeNom", "cantonNom", "nomLocalite", "etabNom", "description", "type", "etabCreationDate"],
  supermarches: ["regionNom", "prefectureNom", "communeNom", "cantonNom", "nomLocalite", "etabNom", "description", "etabJour", "toiletteType", "etabAdresse", "type", "activiteStatut", "activiteCategorie", "etabCreationDate"],
  touristique: ["regionNom", "prefectureNom", "communeNom", "cantonNom", "nomLocalite", "etabNom", "description", "etabJour", "etabAdresse", "type"],
}

const fieldLabels = {
  regionNom: "Région",
  prefectureNom: "Préfecture",
  communeNom: "Commune",
  cantonNom: "Canton",
  nomLocalite: "Localité",
  etabNom: "Nom de l'établissement",
  description: "Description",
  etabJour: "Jours d'ouverture",
  toiletteType: "Type de toilettes",
  etabAdresse: "Adresse",
   type: "Type de lieu",
  activiteStatut: "Statut d'activité",
  activiteCategorie: "Catégorie d'activité",
  etabCreationDate: "Date de création",
  geometry: "Emplacement géographique",
  // status: "Statut (actif/inactif)",
  etablissement_type: "Type d'établissement de loisir",
  terrain: "Type de terrain",
  organisme: "Organisme",
  typeSiteDeux: "Type de site",
  ministereTutelle: "Ministère de tutelle",
  religion: "Religion",
}

function formatGeometry(geometry: string) {
  if (!geometry) return null
  const pointMatch = geometry.match(/POINT\s*\(([-\d.]+)\s+([-\d.]+)\)/)
  const polygonMatch = geometry.match(/POLYGON\s*\(\(([-\d. ,]+)\)\)/)
  const multiPolygonMatch = geometry.match(/MULTIPOLYGON\s*\(\(\(([-\d. ,]+)\)\)\)/)

  const match = pointMatch || polygonMatch || multiPolygonMatch
  if (!match) return null

  if (pointMatch) {
    return { lat: parseFloat(pointMatch[2]), lng: parseFloat(pointMatch[1]) }
  }

  const coords = match[1].split(',').map((coord) => coord.trim().split(' '))
  const firstCoord = coords[0]
  return { lat: parseFloat(firstCoord[1]), lng: parseFloat(firstCoord[0]) }
}

function getFieldValue(lieu: Lieu, field: string) {
  if (lieu[field as keyof Lieu] !== undefined) return lieu[field as keyof Lieu]

  switch (lieu.type) {
    case "loisirs":
      if (field === "etablissement_type") return lieu.loisirs?.etablissementType
      break
    case "parcs":
      if (field === "terrain") return lieu.parcsJardins?.terrain
      break
    case "marches":
      if (field === "organisme") return lieu.marches?.organisme
      break
    case "sites":
      if (field === "typeSiteDeux") return lieu.sitesNaturels?.typeSiteDeux
      if (field === "ministereTutelle") return lieu.sitesNaturels?.ministereTutelle
      if (field === "religion") return lieu.sitesNaturels?.religion
      break
  }
  return undefined
}

function ImageCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  return (
    <div className="relative group">
      <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
        <Image
          src={images[currentIndex] || NO_IMAGE}
          alt={`Vue ${currentIndex + 1}`}
          fill
          className="object-cover transition-all duration-500"
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <IconChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <IconChevronRight className="size-4" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "size-2 rounded-full transition-all",
                  index === currentIndex ? "bg-white w-6" : "bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function InformationAccordion({ lieu }: { lieu: Lieu }) {
  const [openSections, setOpenSections] = useState<string[]>(["localisation"])

  const sections = [
    {
      id: "localisation",
      title: "Localisation",
      icon: IconMapPin,
      fields: ["regionNom", "prefectureNom", "communeNom", "cantonNom", "nomLocalite"],
    },
    {
      id: "horaires",
      title: "Horaires & Disponibilité",
      icon: IconClock,
      fields: ["etabJour"],
    },
    {
      id: "details",
      title: "Détails spécifiques",
      icon: IconInfoCircle,
      fields: fieldsByType[lieu.type as keyof typeof fieldsByType] || [],
    },
  ]

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="border border-border/50 rounded-xl overflow-hidden"
        >
          <button
            onClick={() =>
              setOpenSections((prev) =>
                prev.includes(section.id)
                  ? prev.filter((id) => id !== section.id)
                  : [...prev, section.id]
              )
            }
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <section.icon className="size-5 text-primary" />
              <span className="font-semibold">{section.title}</span>
            </div>
            <IconChevronDown
              className={cn(
                "size-5 transition-transform",
                openSections.includes(section.id) && "rotate-180"
              )}
            />
          </button>

          <AnimatePresence>
            {openSections.includes(section.id) && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4 space-y-3">
                  {section.fields.map((field) => {
                    const value = getFieldValue(lieu, field)
                    if (!value) return null
                    return (
                      <div key={field} className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">
                          {fieldLabels[field as keyof typeof fieldLabels]}
                        </span>
                        <span className="text-sm font-medium text-right">{String(value)}</span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}

function LocationCard({ coordinates, lieu }: { coordinates: any; lieu: Lieu }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="h-64 relative">
          <LeafletMap
            latitude={coordinates.lat}
            longitude={coordinates.lng}
            placeName={lieu.etabNom}
          />
        </div>
        <div className="p-4 space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`,
                "_blank"
              )
            }}
          >
            <IconNavigation className="size-4 mr-2" />
            Itinéraire
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActions({ lieu }: { lieu: Lieu }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Button className="w-full" size="lg">
          <IconPhone className="size-4 mr-2" />
          Contacter
        </Button>
        <Button variant="outline" className="w-full">
          <IconShare className="size-4 mr-2" />
          Partager
        </Button>
        <Button variant="ghost" className="w-full">
          <IconBookmark className="size-4 mr-2" />
          Sauvegarder
        </Button>
      </CardContent>
    </Card>
  )
}

export default function LieuDetailPage() {
    const router = useRouter()
    const params = useParams()
    const [lieu, setLieu] = useState<Lieu | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
  
    /* ⬅️ HOOKS TOUJOURS AVANT LES RETURN ⬅️ */
    const images = useMemo(
      () => (lieu ? normalizeImages(lieu.etabImages) : []),
      [lieu?.etabImages]
    )
    const coordinates = useMemo(
      () => (lieu ? formatGeometry(lieu.geometry) || extractCoordinates(lieu.geometry) : null),
      [lieu?.geometry]
    )
  
    useEffect(() => {
      const fetchLieu = async () => {
        if (!params?.id) return
        try {
          const res = await fetch(buildApiUrl(`/api/lieux/${params.id}`), {
            headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
          })
          if (!res.ok) throw new Error(`Erreur ${res.status}`)
          const json = await res.json()
          if (json.success) setLieu(json.data)
          else throw new Error(json.message || "Erreur inconnue")
        } catch (e: any) {
          setError(e.message)
        } finally {
          setLoading(false)
        }
      }
      fetchLieu()
    }, [params?.id])
  
    /* --------- RENDUS CONDITIONNELS --------- */
    if (loading)
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      )
  
    if (error)
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-destructive">Erreur : {error}</p>
        </div>
      )
  
    if (!lieu)
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Lieu non trouvé</p>
        </div>
      )
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-[62vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <Image src={images[0] || NO_IMAGE} alt={lieu.etabNom} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-end pb-8">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="backdrop-blur-sm bg-white/10 text-white border-white/20">
                {getTypeIcon(lieu.type)} {translateType(lieu.type)}
              </Badge>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">{lieu.etabNom}</h1>

            <div className="flex items-center gap-2 text-white/90">
              <IconMapPin className="size-5" />
              <span className="text-lg">{[lieu.nomLocalite, lieu.cantonNom, lieu.communeNom].filter(Boolean).join(" • ")}</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Content Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-semibold mb-4">À propos</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-lg">{lieu.description}</div>
            </motion.div>

            <InformationAccordion lieu={lieu} />
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <ImageCarousel images={images} />
              {coordinates && <LocationCard coordinates={coordinates} lieu={lieu} />}
              <QuickActions lieu={lieu} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}