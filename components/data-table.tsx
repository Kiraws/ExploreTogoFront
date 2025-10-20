"use client"
import * as React from "react"
import { toast } from "sonner"
import { useState, useMemo} from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLoader,
  IconPlus,
  IconMapPin,
  IconBuilding,
  IconLocation,
  IconEdit,
  IconTrash,
  IconX,
} from "@tabler/icons-react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { buildApiUrl } from "@/lib/config"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Interface pour les lieux basée sur ton schéma Prisma
export interface Lieu {
  id: string // Changé de bigint à string pour la compatibilité avec dnd-kit
  etabImages: string[]
  regionNom: string
  prefectureNom: string
  communeNom: string
  cantonNom: string
  nomLocalite?: string
  etabNom: string
  etabJour?: string[]
  toiletteType?: string
  etabAdresse?: string
  type: string
  description?: string
  activiteStatut?: string
  activiteCategorie?: string
  etabCreationDate?: string
  geometry: string
  status: boolean
  createdAt: string // Changé de Date à string
  updatedAt: string // Changé de Date à string
  images?: ImageItem[]
  likes?: Like[]
  favorites?: Favorite[]
  // Champs spécifiques pour les types de lieu
  etablissement_type?: string
  terrain?: string
  organisme?: string
  typeSiteDeux?: string
  ministereTutelle?: string
  religion?: string
  // Nested properties for specific types (conservées pour compatibilité)
  loisirs?: { etablissementType?: string }
  parcsJardins?: { terrain?: string }
  marches?: { organisme?: string }
  sitesNaturels?: { typeSiteDeux?: string; ministereTutelle?: string; religion?: string }
  hotels?: Record<string, unknown>
  supermarchesEtablissement?: Record<string, unknown>
  etablissementTouristique?: Record<string, unknown>
  zonesProtegees?: Record<string, unknown>
}

// Interface pour le formulaire d'ajout de lieu
interface LieuFormData {
  etabNom: string
  type: string
  regionNom: string
  prefectureNom: string
  communeNom: string
  cantonNom: string
  nomLocalite?: string
  etabAdresse?: string
  description?: string
  etabJour?: string[]
  toiletteType?: string
  etabCreationDate?: string
  activiteStatut?: string
  activiteCategorie?: string
  geometry: string
  etabImages: File[]
  // Champs spécifiques
  etablissement_type?: string
  terrain?: string
  organisme?: string
  typeSiteDeux?: string
  ministereTutelle?: string
  religion?: string
}

interface Like {
  idLike: string
  createdAt: string
  userId: string
  lieuId: string
}

interface Favorite {
  idFavorite: string
  createdAt: string
  lieuId: string
  userId: string
}

interface ImageItem {
  idImage: string
  lieuId: string
  imageUrl: string
  createdAt: string
}

// Données initiales pour le formulaire
const initialFormState: LieuFormData = {
  etabNom: "",
  type: "loisirs",
  regionNom: "",
  prefectureNom: "",
  communeNom: "",
  cantonNom: "",
  geometry: "",
  etabImages: [],
}

const lieuTypes = [
  "loisirs",
  "hotels",
  "parcs",
  "marches",
  "sites",
  "zones",
  "supermarches",
  "touristique",
]

const openingDays = [
  "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"
]

// Fonction pour extraire les coordonnées GPS de la géométrie
function extractCoordinates(geometry: string) {
  if (geometry.includes("POINT")) {
    const match = geometry.match(/POINT\(([^)]+)\)/)
    if (match) {
      const [lng, lat] = match[1].split(" ").map(Number)
      return { lat, lng }
    }
  }
  return null
}

// Fonction pour reconstruire le chemin d'image depuis l'objet
// function reconstructImagePath(imageObj: string | Record<string, string>): string {
//   if (typeof imageObj === "string") {
//     return imageObj
//   }
//   if (typeof imageObj === "object" && imageObj !== null) {
//     const pathParts = Object.keys(imageObj)
//       .sort((a, b) => Number.parseInt(a) - Number.parseInt(b))
//       .map((key) => imageObj[key])
//     const fullPath = pathParts.join("")
//     if (fullPath.startsWith("E:/")) {
//       const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030"
//       return fullPath.replace("E:/Open Data Science/ExploreTogoBack/uploads/", `${apiBaseUrl}/uploads/`)
//     }
//     return fullPath
//   }
//   return ""
// }

// Fonction pour obtenir le type d'icône selon le type de lieu
function getTypeIcon(type: string) {
  switch (type) {
    case "hotels":
      return <IconBuilding className="size-4" />
    case "supermarches":
    case "loisirs":
    case "marches":
    case "touristique":
      return <IconMapPin className="size-4" />
    case "parcs":
    case "sites":
    case "zones":
      return <IconLocation className="size-4" />
    default:
      return <IconMapPin className="size-4" />
  }
}

// Fonction pour obtenir la couleur du badge selon le type
function getTypeBadgeVariant(type: string) {
  switch (type) {
    case "hotels":
    case "zones":
      return "default"
    case "supermarches":
    case "marches":
    case "touristique":
      return "secondary"
    case "parcs":
    case "sites":
      return "outline"
    case "loisirs":
      return "destructive"
    default:
      return "outline"
  }
}

// Fonction pour traduire le type en français
function translateType(type: string) {
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
  return translations[type] || type
}

// // Fonction pour normaliser les jours
// function normalizeDays(days: unknown): string[] {
//   if (!Array.isArray(days)) return []
//   return days.map((d) => {
//     if (typeof d === "object") {
//       return Object.values(d).join("")
//     }
//     return d
//   })
// }

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id: id,
  })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// Composant de formulaire autonome pour ajouter un lieu
function AddLieuForm({ onAdd, onOpenChange }: { onAdd: (newLieu: Lieu) => void, onOpenChange: (open: boolean) => void }) {
  const [form, setForm] = useState<LieuFormData>(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  
  // Définir les champs pertinents par type
  const fieldsByType = {
    loisirs: [
      "regionNom",
      "prefectureNom",
      "communeNom",
      "cantonNom",
      "etabNom",
      "description",
      "etabJour",
      "type",
      "geometry",
      "status",
      "etablissement_type",
    ],
    hotels: [
      "regionNom",
      "prefectureNom",
      "communeNom",
      "cantonNom",
      "nomLocalite",
      "etabNom",
      "description",
      "toiletteType",
      "type",
      "geometry",
      "status",
    ],
    parcs: [
      "regionNom",
      "prefectureNom",
      "communeNom",
      "cantonNom",
      "nomLocalite",
      "etabNom",
      "etabAdresse",
      "description",
      "etabJour",
      "toiletteType",
      "etabAdresse",
      "type",
      "activiteStatut",
      "activiteCategorie",
      "geometry",
      "status",
      "terrain",
    ],
    marches: [
      "regionNom",
      "prefectureNom",
      "communeNom",
      "cantonNom",
      "nomLocalite",
      "etabNom",
      "description",
      "etabJour",
      "type",
      "geometry",
      "status",
      "organisme",
    ],
    sites: [
      "regionNom",
      "prefectureNom",
      "communeNom",
      "cantonNom",
      "nomLocalite",
      "etabNom",
      "description",
      "etabJour",
      "etabAdresse",
      "type",
      "geometry",
      "status",
      "typeSiteDeux",
      "ministereTutelle",
      "religion",
    ],
    zones: [
      "regionNom",
      "prefectureNom",
      "communeNom",
      "cantonNom",
      "nomLocalite",
      "etabNom",
      "description",
      "type",
      "etabCreationDate",
      "geometry",
      "status",
    ],
    supermarches: [
      "regionNom",
      "prefectureNom",
      "communeNom",
      "cantonNom",
      "nomLocalite",
      "etabNom",
      "description",
      "etabJour",
      "toiletteType",
      "etabAdresse",
      "type",
      "activiteStatut",
      "activiteCategorie",
      "etabCreationDate",
      "geometry",
      "status",
    ],
    touristique: [
      "regionNom",
      "prefectureNom",
      "communeNom",
      "cantonNom",
      "nomLocalite",
      "etabNom",
      "description",
      "etabJour",
      "etabAdresse",
      "type",
      "geometry",
      "status",
    ],
  }

  const relevantFields = fieldsByType[form.type as keyof typeof fieldsByType] || []
  const shouldShowField = (fieldName: string) => relevantFields.includes(fieldName)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setForm({ ...form, [id]: value })
  }

  const handleSelectChange = (id: keyof LieuFormData) => (value: string) => {
    setForm({ ...form, [id]: value })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
    const validFiles = Array.from(files).filter(file =>
    ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type) && file.size < 5 * 1024 * 1024
    )
    if (validFiles.length !== files.length) {
    toast.error("Seuls les fichiers JPEG, PNG, JPG ou WebP de moins de 5MB sont acceptés.")
    }
    setForm(prev => ({ ...prev, etabImages: validFiles }))
    const previews = validFiles.map(file => URL.createObjectURL(file))
    setImagePreviews(previews)
    }
    }
    
    
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData()
    // ... construction du formData ...*
    formData.append("etabNom", form.etabNom)
    formData.append("type", form.type)
    formData.append("regionNom", form.regionNom)
    formData.append("prefectureNom", form.prefectureNom)
    formData.append("communeNom", form.communeNom)
    formData.append("cantonNom", form.cantonNom)
    formData.append("geometry", form.geometry || "POINT(0 0)")
    if (form.nomLocalite) formData.append("nomLocalite", form.nomLocalite)
    if (form.etabAdresse) formData.append("etabAdresse", form.etabAdresse)
    if (form.description) formData.append("description", form.description)
    if (form.toiletteType) formData.append("toiletteType", form.toiletteType)
    formData.append("etabJour", JSON.stringify(form.etabJour || []))
    if (form.etabCreationDate) formData.append("etabCreationDate", form.etabCreationDate)
    if (form.activiteStatut) formData.append("activiteStatut", form.activiteStatut)
    if (form.activiteCategorie) formData.append("activiteCategorie", form.activiteCategorie)
    if (form.etablissement_type) formData.append("etablissement_type", form.etablissement_type)
    if (form.terrain) formData.append("terrain", form.terrain)
    if (form.organisme) formData.append("organisme", form.organisme)
    if (form.typeSiteDeux) formData.append("typeSiteDeux", form.typeSiteDeux)
    if (form.ministereTutelle) formData.append("ministereTutelle", form.ministereTutelle)
    if (form.religion) formData.append("religion", form.religion)
    if (form.etabImages.length > 0) {
      form.etabImages.forEach((file) => formData.append("images", file))
    }
    formData.append("status", "true")
    try {
    const token = localStorage.getItem("token")
    const response = await fetch(buildApiUrl("/api/lieux"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    })
    if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Erreur ${response.status}: ${errorData.message || response.statusText}`)
    }
    const result = await response.json()
    onAdd(result.data)
    onOpenChange(false)
    setForm(initialFormState)
    setImagePreviews([])
    toast.success("Lieu ajouté avec succès !")
    } catch (error: unknown) {
    toast.error("Erreur lors de la création du lieu.")
    console.error(error)
    } finally {
    setIsSubmitting(false)
    }
    }

  React.useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview))
    }
  }, [imagePreviews])

  const handleDayChange = (day: string, checked: boolean) => {
    setForm((prevForm) => {
      const currentDays = prevForm.etabJour || []
      const newDays = checked
        ? [...currentDays, day]
        : currentDays.filter((d) => d !== day)
      return { ...prevForm, etabJour: newDays }
    })
  }



  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="etabNom">Nom de l&apos;établissement *</Label>
          <Input id="etabNom" value={form.etabNom} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="type">Type de lieu *</Label>
          <Select onValueChange={handleSelectChange("type")} value={form.type}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              {lieuTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {translateType(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {shouldShowField("regionNom") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="regionNom">Région</Label>
          <Input id="regionNom" value={form.regionNom || ""} onChange={handleChange} />
        </div>
      )}
      {shouldShowField("prefectureNom") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="prefectureNom">Préfecture</Label>
          <Input id="prefectureNom" value={form.prefectureNom || ""} onChange={handleChange} />
        </div>
      )}
      {shouldShowField("communeNom") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="communeNom">Commune</Label>
          <Input id="communeNom" value={form.communeNom || ""} onChange={handleChange} />
        </div>
      )}
      {shouldShowField("cantonNom") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="cantonNom">Canton</Label>
          <Input id="cantonNom" value={form.cantonNom || ""} onChange={handleChange} />
        </div>
      )}
      {shouldShowField("nomLocalite") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="nomLocalite">Localité</Label>
          <Input id="nomLocalite" value={form.nomLocalite || ""} onChange={handleChange} />
        </div>
      )}
      {shouldShowField("etabAdresse") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="etabAdresse">Adresse</Label>
          <Input id="etabAdresse" value={form.etabAdresse || ""} onChange={handleChange} />
        </div>
      )}
      {shouldShowField("geometry") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="geometry">Géométrie *</Label>
          <Input id="geometry" value={form.geometry} onChange={handleChange} required placeholder="Ex: POINT(1.23 4.56)" />
        </div>
      )}
      {shouldShowField("etablissement_type") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="etablissement_type">Type d&apos;établissement de loisirs</Label>
          <Input id="etablissement_type" value={form.etablissement_type || ""} onChange={handleChange} />
        </div>
      )}
      {shouldShowField("terrain") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="terrain">Terrain</Label>
          <Input id="terrain" value={form.terrain || ""} onChange={handleChange} />
        </div>
      )}
      {shouldShowField("organisme") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="organisme">Organisme</Label>
          <Input id="organisme" value={form.organisme || ""} onChange={handleChange} />
        </div>
      )}
      {shouldShowField("typeSiteDeux") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="typeSiteDeux">Type de site</Label>
          <Input id="typeSiteDeux" value={form.typeSiteDeux || ""} onChange={handleChange} />
        </div>
      )}
      {shouldShowField("ministereTutelle") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="ministereTutelle">Ministère de tutelle</Label>
          <Input id="ministereTutelle" value={form.ministereTutelle || ""} onChange={handleChange} />
        </div>
      )}
      {shouldShowField("religion") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="religion">Religion</Label>
          <Input id="religion" value={form.religion || ""} onChange={handleChange} />
        </div>
      )}
      {shouldShowField("etabJour") && (
        <div className="flex flex-col gap-2">
          <Label>Jours d&apos;ouverture</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {openingDays.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={form.etabJour?.includes(day) || false}
                  onCheckedChange={(checked) => handleDayChange(day, !!checked)}
                />
                <Label htmlFor={`day-${day}`}>{day}</Label>
              </div>
            ))}
          </div>
        </div>
      )}
      {shouldShowField("toiletteType") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="toiletteType">Type de toilettes</Label>
          <Input id="toiletteType" value={form.toiletteType || ""} onChange={handleChange} />
        </div>
      )}
      {shouldShowField("activiteStatut") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="activiteStatut">Statut d&apos;activité</Label>
          <Select onValueChange={handleSelectChange("activiteStatut")} value={form.activiteStatut || ""}>
            <SelectTrigger id="activiteStatut">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="En activité">En activité</SelectItem>
              <SelectItem value="En rénovation">En rénovation</SelectItem>
              <SelectItem value="Fermé">Fermé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      {shouldShowField("activiteCategorie") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="activiteCategorie">Catégorie d&apos;activité</Label>
          <Input id="activiteCategorie" value={form.activiteCategorie || ""} onChange={handleChange} />
        </div>
      )}
      {shouldShowField("etabCreationDate") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="etabCreationDate">Date de création</Label>
          <Input id="etabCreationDate" value={form.etabCreationDate || ""} onChange={handleChange} />
        </div>
      )}
      {shouldShowField("description") && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={form.description || ""} onChange={handleChange} />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="images">Images</Label>
        <Input id="images" type="file" multiple onChange={handleImageChange} accept="image/jpeg,image/png,image/jpg,image/webp" />
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={(e) => {
                    e.preventDefault()
                    const newPreviews = imagePreviews.filter((_, i) => i !== index)
                    const newFiles = Array.from(form.etabImages).filter((_, i) => i !== index)
                    setImagePreviews(newPreviews)
                    setForm(prev => ({ ...prev, etabImages: newFiles }))
                    URL.revokeObjectURL(preview)
                  }}
                >
                  <IconX className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Envoi en cours..." : "Enregistrer le lieu"}
        </Button>
      </DialogFooter>
    </form>
  )
}

const columns: ColumnDef<Lieu>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "etabNom",
    header: "Nom de l'établissement",
    cell: ({ row }) => {
      return <LieuDetailsViewer lieu={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {getTypeIcon(row.original.type)}
        <Badge variant={getTypeBadgeVariant(row.original.type)} className="px-2">
          {translateType(row.original.type)}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "regionNom",
    header: "Région",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.regionNom}</span>
        <span className="text-xs text-muted-foreground">{row.original.prefectureNom}</span>
      </div>
    ),
  },
  {
    accessorKey: "etabAdresse",
    header: "Adresse",
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        <div className="truncate" title={row.original.etabAdresse}>
          {row.original.etabAdresse || "Non spécifiée"}
        </div>
        {row.original.nomLocalite && (
          <div className="text-xs text-muted-foreground truncate">{row.original.nomLocalite}</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Actif",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
        ) : (
          <IconLoader className="text-muted-foreground" />
        )}
        {row.original.status ? "Actif" : "Inactif"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {/* <DropdownMenuItem>
            <IconEye className="mr-2 size-4" />
            Voir détails
          </DropdownMenuItem> */}
          <DropdownMenuItem>
            <IconEdit className="mr-2 size-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onSelect={async () => {
            try {
            const token = localStorage.getItem("token")
            const response = await fetch(buildApiUrl(`/api/lieux/${row.original.id}/desactivate`), {
            method: "PATCH",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            })
            if (!response.ok) throw new Error(`Erreur ${response.status}`)
            toast.success("Lieu désactivé avec succès.")
            } catch (err) {
            toast.error("Erreur lors de la désactivation.")
            console.error(err)
            }
            }}
            >
            <IconTrash className="mr-2 size-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DraggableRow({ row }: { row: Row<Lieu> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
      ))}
    </TableRow>
  )
}

function DataTableContent({ data }: { data: Lieu[] }) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })
  return (
    <>
      <Table>
        <TableHeader className="bg-muted sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Aucun résultat trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} sur {table.getFilteredRowModel().rows.length} ligne(s)
          sélectionnée(s).
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Lignes par page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex bg-transparent"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Aller à la première page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8 bg-transparent"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Aller à la page précédente</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8 bg-transparent"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Aller à la page suivante</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex bg-transparent"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Aller à la dernière page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export function DataTable({ data: initialData }: { data: Lieu[] }) {
  const [data, setData] = useState<Lieu[]>(initialData)
  const [showAddModal, setShowAddModal] = useState(false)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const sortableId = React.useId()
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor), useSensor(KeyboardSensor))
  const dataIds = useMemo<UniqueIdentifier[]>(() => data.map(({ id }) => id), [data])

  // ✅ Déclare GlobalFilter ici
  function GlobalFilter({ globalFilter, setGlobalFilter }: { globalFilter: string; setGlobalFilter: (value: string) => void }) {
    return (
      <Input
        placeholder="Rechercher un lieu..."
        value={globalFilter ?? ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />
    )
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter, // ✅ Ajoute ici
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter, // ✅ Ajoute ici
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // ✅ Une seule fois
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })


 
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((prevData) => {
        const oldIndex = prevData.findIndex(item => item.id === active.id)
        const newIndex = prevData.findIndex(item => item.id === over.id)
        return arrayMove(prevData, oldIndex, newIndex)
      })
    }
  }
  const handleAddLieuSuccess = (newLieu: Lieu) => {
    setData((prevData) => [...prevData, newLieu])
  }
  return (
    <>
      <Tabs defaultValue="lieux" className="w-full flex-col justify-start gap-6">
        {/* Add search bar above everything */}
        <div className="px-4 lg:px-6">
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
        </div>
        <div className="flex items-center justify-between px-4 lg:px-6">
          <Label htmlFor="view-selector" className="sr-only">Vue</Label>
          <Select defaultValue="lieux">
            <SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm" id="view-selector">
              <SelectValue placeholder="Sélectionner une vue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lieux">Lieux</SelectItem>
              <SelectItem value="statistiques">Statistiques</SelectItem>
              <SelectItem value="carte">Carte</SelectItem>
            </SelectContent>
          </Select>
          <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
            <TabsTrigger value="lieux">Tous les lieux</TabsTrigger>
            <TabsTrigger value="hotels">Hôtels</TabsTrigger>
            <TabsTrigger value="supermarches">Supermarchés</TabsTrigger>
            <TabsTrigger value="parcs">Parcs & Jardins</TabsTrigger>
            <TabsTrigger value="loisirs">Loisirs</TabsTrigger>
            <TabsTrigger value="marches">Marchés</TabsTrigger>
            <TabsTrigger value="sites">Sites Naturels</TabsTrigger>
            <TabsTrigger value="zones">Zones Protégées</TabsTrigger>
            <TabsTrigger value="touristique">Touristique</TabsTrigger>
          </TabsList>
         <div className="flex items-center gap-2">
         
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
              <IconPlus />
              <span className="hidden lg:inline">Ajouter un lieu</span>
            </Button>
        </div>
        </div>
      
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau lieu</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour ajouter un nouveau lieu à la base de données.
              </DialogDescription>
            </DialogHeader>
            <AddLieuForm
              onAdd={handleAddLieuSuccess}
              onOpenChange={setShowAddModal}
            />
          </DialogContent>
        </Dialog>
      
        <TabsContent value="lieux" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <div className="overflow-hidden rounded-lg border">
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
              sensors={sensors}
              id={sortableId}
            >
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody className="**:data-[slot=table-cell]:first:w-8">
                  {table.getRowModel().rows?.length ? (
                    <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                      {table.getRowModel().rows.map((row) => (
                        <DraggableRow key={row.id} row={row} />
                      ))}
                    </SortableContext>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        Aucun résultat trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DndContext>
          </div>
          <div className="flex items-center justify-between px-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} sur {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">Lignes par page</Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => { table.setPageSize(Number(value)) }}
                >
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex bg-transparent"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Aller à la première page</span>
                  <IconChevronsLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8 bg-transparent"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Aller à la page précédente</span>
                  <IconChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8 bg-transparent"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Aller à la page suivante</span>
                  <IconChevronRight />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex bg-transparent"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Aller à la dernière page</span>
                  <IconChevronsRight />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      
        <TabsContent value="hotels" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <div className="overflow-hidden rounded-lg border">
            <DataTableContent data={data.filter((lieu) => lieu.type === "hotels")} />
          </div>
        </TabsContent>
        <TabsContent value="supermarches" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <div className="overflow-hidden rounded-lg border">
            <DataTableContent data={data.filter((lieu) => lieu.type === "supermarches")} />
          </div>
        </TabsContent>
        <TabsContent value="parcs" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <div className="overflow-hidden rounded-lg border">
            <DataTableContent data={data.filter((lieu) => lieu.type === "parcs")} />
          </div>
        </TabsContent>
        <TabsContent value="loisirs" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <div className="overflow-hidden rounded-lg border">
            <DataTableContent data={data.filter((lieu) => lieu.type === "loisirs")} />
          </div>
        </TabsContent>
        <TabsContent value="marches" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <div className="overflow-hidden rounded-lg border">
            <DataTableContent data={data.filter((lieu) => lieu.type === "marches")} />
          </div>
        </TabsContent>
        <TabsContent value="sites" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <div className="overflow-hidden rounded-lg border">
            <DataTableContent data={data.filter((lieu) => lieu.type === "sites")} />
          </div>
        </TabsContent>
        <TabsContent value="zones" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <div className="overflow-hidden rounded-lg border">
            <DataTableContent data={data.filter((lieu) => lieu.type === "zones")} />
          </div>
        </TabsContent>
        <TabsContent value="touristique" className="relative flex-col gap-4 overflow-auto px-4 lg:px-6">
          <div className="overflow-hidden rounded-lg border">
            <DataTableContent data={data.filter((lieu) => lieu.type === "touristique")} />
          </div>
        </TabsContent>
        <TabsContent value="carte" className="flex flex-col px-4 lg:px-6">
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Carte des lieux</h3>
                <p className="text-muted-foreground">Intégration carte à venir</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}

// Définition du type pour le formulaire d’un lieu
type LieuForm = {
  etabNom: string
  type: string
  activiteStatut: string
  regionNom: string
  prefectureNom: string
  communeNom: string
  cantonNom: string
  nomLocalite: string
  etabAdresse: string
  description: string
  etabJour: string[]
  toiletteType: string
  etabCreationDate: string
  activiteCategorie: string
  etablissement_type: string
  terrain: string
  organisme: string
  typeSiteDeux: string
  ministereTutelle: string
  religion: string
}

// Composant pour afficher et modifier les détails d’un lieu
function LieuDetailsViewer({ lieu }: { lieu: Lieu }) {
  const isMobile = useIsMobile()
  const coordinates = extractCoordinates(lieu.geometry)

  // Définir les champs pertinents par type
  const fieldsByType = {
    loisirs: [
      "regionNom",
      "prefectureNom",
      "communeNom",
      "cantonNom",
      "etabNom",
      "etabAdresse",
      "description",
      "etabJour",
      "type",
      "geometry",
      "status",
      "etablissement_type",
    ],
    hotels: [
      "regionNom",
      "prefectureNom",
      "communeNom",
      "cantonNom",
      "nomLocalite",
      "etabNom",
      "etabAdresse",
      "description",
      "toiletteType",
      "type",
      "geometry",
      "status",
    ],
    parcs: [
      "regionNom",
      "prefectureNom",
      "communeNom",
      "cantonNom",
      "nomLocalite",
      "etabNom",
      "etabAdresse",
      "description",
      "etabJour",
      "toiletteType",
      "etabAdresse",
      "type",
      "activiteStatut",
      "activiteCategorie",
      "geometry",
      "status",
      "terrain",
    ],
    marches: [
      "regionNom",
      "prefectureNom",
      "communeNom",
      "cantonNom",
      "nomLocalite",
      "etabNom",
      "etabAdresse",
      "description",
      "etabJour",
      "type",
      "geometry",
      "status",
      "organisme",
    ],
    sites: [
      "regionNom",
      "prefectureNom",
      "communeNom",
      "cantonNom",
      "nomLocalite",
      "etabNom",
      "etabAdresse",
      "description",
      "etabJour",
      "etabAdresse",
      "type",
      "geometry",
      "status",
      "typeSiteDeux",
      "ministereTutelle",
      "religion",
    ],
    zones: [
      "regionNom",
      "prefectureNom",
      "communeNom",
      "cantonNom",
      "nomLocalite",
      "etabNom",
      "etabAdresse",
      "description",
      "type",
      "etabCreationDate",
      "geometry",
      "status",
    ],
    supermarches: [
      "regionNom",
      "prefectureNom",
      "communeNom",
      "cantonNom",
      "nomLocalite",
      "etabNom",
      "etabAdresse",
      "description",
      "etabJour",
      "toiletteType",
      "etabAdresse",
      "type",
      "activiteStatut",
      "activiteCategorie",
      "etabCreationDate",
      "geometry",
      "status",
    ],
    touristique: [
      "regionNom",
      "prefectureNom",
      "communeNom",
      "cantonNom",
      "nomLocalite",
      "etabNom",
      "etabAdresse",
      "description",
      "etabJour",
      "etabAdresse",
      "type",
      "geometry",
      "status",
    ],
  }

  const openingDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"] as const

  // Helpers de normalisation
  // const canonicalizeDay = (raw: string): string => {
  //   const lower = raw.trim().toLowerCase()
  //   switch (lower) {
  //     case "lundi":
  //       return "Lundi"
  //     case "mardi":
  //       return "Mardi"
  //     case "mercredi":
  //       return "Mercredi"
  //     case "jeudi":
  //       return "Jeudi"
  //     case "vendredi":
  //       return "Vendredi"
  //     case "samedi":
  //       return "Samedi"
  //     case "dimanche":
  //       return "Dimanche"
  //     default:
  //       return raw
  //   }
  // }



  const normalizeOpeningDays = (days: any): string[] => {
    if (!Array.isArray(days)) return [];
  
    return days.map((dayObj) => {
      // Cas 1 : c’est un objet avec des indices -> on recompose la string
      if (typeof dayObj === "object" && dayObj !== null) {
        const word = Object.values(dayObj).join(""); // {0:"d",1:"i",...} => "dimanche"
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
  
      // Cas 2 : c’est déjà une string
      if (typeof dayObj === "string") {
        const word = dayObj.trim().toLowerCase();
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
  
      return "";
    }).filter(Boolean);
  };
  
        
  const reconstructImagePath = (image: string | Record<string, string>): string | null => {
    let path: string | null = null;
  
    if (typeof image === "string") {
      path = image;
    } else if (typeof image === "object" && image !== null) {
      // Concatène toutes les valeurs de l'objet { "0": "E", "1": ":", ... } → "E:/Open Data Science/..."
      path = Object.values(image).join("");
    }
  
    if (!path) return null;
  
    // Si c’est déjà une URL absolue
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
  
    // Si c’est un chemin absolu Windows style "E:/Open Data Science/..."
    if (path.match(/^[A-Z]:\//i)) {
      // Ton backend doit exposer ces fichiers via un dossier public
      // Exemple: http://localhost:3030/uploads/lieux/lieu-xxx.png
      const fileName = path.split(/[/\\]/).pop(); // récupère le nom de fichier
      return `http://localhost:3030/uploads/lieux/${fileName}`;
    }
  
    // Sinon, traite comme chemin relatif
    return `/uploads/${path.replace(/^\/+/, "")}`;
  };
  
  const normalizedEtabJour = React.useMemo(() => normalizeOpeningDays(lieu.etabJour), [lieu.etabJour])

  // État du formulaire
  const [form, setForm] = React.useState<LieuForm>({
    etabNom: lieu.etabNom || "",
    type: lieu.type || "",
    activiteStatut: lieu.activiteStatut || "",
    regionNom: lieu.regionNom || "",
    prefectureNom: lieu.prefectureNom || "",
    communeNom: lieu.communeNom || "",
    cantonNom: lieu.cantonNom || "",
    nomLocalite: lieu.nomLocalite || "",
    etabAdresse: lieu.etabAdresse || "",
    description: lieu.description || "",
    etabJour: normalizedEtabJour,
    toiletteType: lieu.toiletteType || "",
    etabCreationDate: lieu.etabCreationDate || "",
    activiteCategorie: lieu.activiteCategorie || "",
    etablissement_type: lieu.etablissement_type || lieu.loisirs?.etablissementType || "",
    terrain: lieu.terrain || lieu.parcsJardins?.terrain || "",
    organisme: lieu.organisme || lieu.marches?.organisme || "",
    typeSiteDeux: lieu.typeSiteDeux || lieu.sitesNaturels?.typeSiteDeux || "",
    ministereTutelle: lieu.ministereTutelle || lieu.sitesNaturels?.ministereTutelle || "",
    religion: lieu.religion || lieu.sitesNaturels?.religion || "",
  })

  // États pour images
  const [imagesToDelete, setImagesToDelete] = React.useState<string[]>([])
  const [newImages, setNewImages] = React.useState<File[]>([])
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)

  // Effet pour mettre à jour le formulaire si les données du lieu changent
  React.useEffect(() => {
    setForm({
      etabNom: lieu.etabNom || "",
      type: lieu.type || "",
      activiteStatut: lieu.activiteStatut || "",
      regionNom: lieu.regionNom || "",
      prefectureNom: lieu.prefectureNom || "",
      communeNom: lieu.communeNom || "",
      cantonNom: lieu.cantonNom || "",
      nomLocalite: lieu.nomLocalite || "",
      etabAdresse: lieu.etabAdresse || "",
      description: lieu.description || "",
      etabJour: normalizedEtabJour,
      toiletteType: lieu.toiletteType || "",
      etabCreationDate: lieu.etabCreationDate || "",
      activiteCategorie: lieu.activiteCategorie || "",
      etablissement_type: lieu.etablissement_type || lieu.loisirs?.etablissementType || "",
      terrain: lieu.terrain || lieu.parcsJardins?.terrain || "",
      organisme: lieu.organisme || lieu.marches?.organisme || "",
      typeSiteDeux: lieu.typeSiteDeux || lieu.sitesNaturels?.typeSiteDeux || "",
      ministereTutelle: lieu.ministereTutelle || lieu.sitesNaturels?.ministereTutelle || "",
      religion: lieu.religion || lieu.sitesNaturels?.religion || "",
    })
  }, [lieu, normalizedEtabJour])

  // Gestion des changements texte
  const onChange = (key: keyof LieuForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  // Suppression d’image
  const handleDeleteImage = (image: string | Record<string, string>) => {
    const imagePath = reconstructImagePath(image)
    if (!imagePath) return
    setImagesToDelete((prev) => [...prev, imagePath])
  }

  // Ajout de nouvelles images
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files).filter(
      (file) =>
        ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type) &&
        file.size < 5 * 1024 * 1024
    )
    if (files.length !== e.target.files.length) {
      alert("Seuls les fichiers JPEG, PNG, JPG ou WebP de moins de 5MB sont acceptés.")
    }
    setNewImages((prev) => [...prev, ...files])
    const previews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews((prev) => [...prev, ...previews])
  }

  // Nettoyage previews
  React.useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview))
    }
  }, [imagePreviews])

  // Sauvegarde via API PUT
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (key === "etabJour") {
          (value as string[]).forEach((day) => formData.append("etabJour[]", day))
        } else {
          formData.append(key, value as string)
        }
      })
      if (imagesToDelete.length > 0) {
        formData.append("imagesToDelete", JSON.stringify(imagesToDelete))
      }
      newImages.forEach((file) => {
        formData.append("images", file)
      })
      // Ajouter les images existantes non supprimées
      const existingImages = lieu.etabImages
        .map(reconstructImagePath)
        .filter((path): path is string => path !== null && !imagesToDelete.includes(path))
      if (existingImages.length > 0) {
        formData.append("etabImages", JSON.stringify(existingImages))
      }

      const response = await fetch(buildApiUrl(`/api/lieux/${lieu.id}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) throw new Error(`Erreur ${response.status}`)
      const updated = await response.json()
      console.log("Lieu mis à jour :", updated)
      toast.success("Lieu mis à jour avec succès !")
      // Reset états
      setImagesToDelete([])
      setNewImages([])
      setImagePreviews([])
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du lieu.")
      console.error("Erreur lors de la mise à jour :", err)
    }
  }
  

  const relevantFields = fieldsByType[lieu.type as keyof typeof fieldsByType] || fieldsByType.loisirs
  const shouldShowField = (fieldName: string) => relevantFields.includes(fieldName)

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {lieu.etabNom}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="overflow-y-auto overflow-x-hidden">
        <DrawerHeader>
          <DrawerTitle>Modifier le lieu</DrawerTitle>
          <DrawerDescription>Mettre à jour les informations du lieu</DrawerDescription>
        </DrawerHeader>

        {/* Gestion des images */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">Images du lieu</Label>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 bg-transparent"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/jpg,image/webp"
              multiple
              className="hidden"
              onChange={handleAddImages}
            />
          </div>

          {lieu.etabImages && lieu.etabImages.length > 0 && (
            <div className="relative">
              <div className="overflow-hidden rounded-lg border">
                <div
                  className="flex transition-transform duration-300"
                  style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                >
                  {lieu.etabImages.map((imageObj, index) => {
                    const imagePath = reconstructImagePath(imageObj)
                    return (
                      <div key={index} className="w-full flex-shrink-0 relative aspect-video">
                        <Image
                          src={imagePath || '/placeholder.svg'}
                          alt={`Image ${index + 1}`}
                          fill
                          className="object-contain"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 p-0 bg-black/50"
                            onClick={() => handleDeleteImage(imageObj)}
                          >
                            <Trash2 className="h-3 w-3 text-white" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Navigation buttons */}
              {lieu.etabImages.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/50"
                    onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev))}
                    disabled={currentImageIndex === 0}
                  >
                    <IconChevronLeft className="h-4 w-4 text-white" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/50"
                    onClick={() => setCurrentImageIndex((prev) => (prev < lieu.etabImages.length - 1 ? prev + 1 : prev))}
                    disabled={currentImageIndex === lieu.etabImages.length - 1}
                  >
                    <IconChevronRight className="h-4 w-4 text-white" />
                  </Button>
                </>
              )}
            </div>
          )}

          {imagesToDelete.length > 0 && (
            <div className="mt-2">
              <Label className="text-sm font-medium">Images marquées pour suppression :</Label>
              <ul className="list-disc pl-5 text-sm">
                {imagesToDelete.map((img, i) => (
                  <li key={i}>{img}</li>
                ))}
              </ul>
            </div>
          )}

          {imagePreviews.length > 0 && (
            <div className="mt-2">
              <Label className="text-sm font-medium">Nouvelles images :</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-video border rounded-lg overflow-hidden">
                    <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => {
                        const newPrevs = imagePreviews.filter((_, i) => i !== index)
                        const newFiles = newImages.filter((_, i) => i !== index)
                        setImagePreviews(newPrevs)
                        setNewImages(newFiles)
                        URL.revokeObjectURL(preview)
                      }}
                    >
                      <IconX className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Formulaire des autres champs */}
        <div className="flex flex-col gap-4 px-4 text-sm">
<div className="grid gap-4">
  <div className="flex flex-col gap-2">
    <Label htmlFor="etabNom">Nom de l&apos;établissement</Label>
    <Input id="etabNom" value={form.etabNom} onChange={onChange('etabNom')} />
  </div>
  <div className="flex flex-col gap-2">
    <Label htmlFor="type">Type</Label>
    <Select defaultValue={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
      <SelectTrigger id="type" className="w-full">
        <SelectValue placeholder="Sélectionner un type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="hotels">Hôtels</SelectItem>
        <SelectItem value="supermarches">Supermarchés</SelectItem>
        <SelectItem value="parcs">Parcs & Jardins</SelectItem>
        <SelectItem value="loisirs">Loisirs</SelectItem>
        <SelectItem value="marches">Marchés</SelectItem>
        <SelectItem value="sites">Sites Naturels</SelectItem>
        <SelectItem value="zones">Zones Protégées</SelectItem>
        <SelectItem value="touristique">Touristique</SelectItem>
      </SelectContent>
    </Select>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="flex flex-col gap-2">
      <Label htmlFor="regionNom">Région</Label>
      <Input id="regionNom" value={form.regionNom} onChange={onChange('regionNom')} />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="prefectureNom">Préfecture</Label>
      <Input id="prefectureNom" value={form.prefectureNom} onChange={onChange('prefectureNom')} />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="communeNom">Commune</Label>
      <Input id="communeNom" value={form.communeNom} onChange={onChange('communeNom')} />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="cantonNom">Canton</Label>
      <Input id="cantonNom" value={form.cantonNom} onChange={onChange('cantonNom')} />
    </div>
  </div>
  {shouldShowField('nomLocalite') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="nomLocalite">Localité</Label>
      <Input id="nomLocalite" value={form.nomLocalite} onChange={onChange('nomLocalite')} />
    </div>
  )}
  {shouldShowField('etabAdresse') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="etabAdresse">Adresse</Label>
      <Input id="etabAdresse" value={form.etabAdresse} onChange={onChange('etabAdresse')} />
    </div>
  )}
  <div className="flex flex-col gap-2">
    <Label htmlFor="description">Description</Label>
    <Input id="description" value={form.description} onChange={onChange('description')} />
  </div>
  {shouldShowField('etabJour') && (
    <div className="flex flex-col gap-2">
      <Label>Jours d&apos;ouverture</Label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {openingDays.map((day) => (
          <div key={day} className="flex items-center space-x-2">
            <Checkbox
              id={`day-${day}`}
              checked={form.etabJour.includes(day)}
              onCheckedChange={(checked) => {
                setForm((prev) => ({
                  ...prev,
                  etabJour: checked
                    ? [...prev.etabJour, day]
                    : prev.etabJour.filter((d) => d !== day),
                }))
              }}
            />
            <Label htmlFor={`day-${day}`}>{day}</Label>
          </div>
        ))}
      </div>
    </div>
  )}
  
  {shouldShowField('toiletteType') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="toiletteType">Type de toilettes</Label>
      <Input id="toiletteType" value={form.toiletteType} onChange={onChange('toiletteType')} />
    </div>
  )}
  {shouldShowField('activiteStatut') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="activiteStatut">Statut d&apos;activité</Label>
      <Select
        value={form.activiteStatut}
        onValueChange={(value) => setForm((prev) => ({ ...prev, activiteStatut: value }))}
      >
        <SelectTrigger id="activiteStatut">
          <SelectValue placeholder="Sélectionner un statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="En activité">En activité</SelectItem>
          <SelectItem value="En rénovation">En rénovation</SelectItem>
          <SelectItem value="Fermé">Fermé</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )}
  {shouldShowField('activiteCategorie') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="activiteCategorie">Catégorie d&apos;activité</Label>
      <Input
        id="activiteCategorie"
        value={form.activiteCategorie}
        onChange={onChange('activiteCategorie')}
      />
    </div>
  )}
  {shouldShowField('etabCreationDate') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="etabCreationDate">Date de création</Label>
      <Input
        id="etabCreationDate"
        value={form.etabCreationDate}
        onChange={onChange('etabCreationDate')}
      />
    </div>
  )}
  {shouldShowField('etablissement_type') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="etablissement_type">Type d&apos;établissement</Label>
      <Input
        id="etablissement_type"
        value={form.etablissement_type}
        onChange={onChange('etablissement_type')}
      />
    </div>
  )}
  {shouldShowField('terrain') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="terrain">Terrain</Label>
      <Input id="terrain" value={form.terrain} onChange={onChange('terrain')} />
    </div>
  )}
  {shouldShowField('organisme') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="organisme">Organisme</Label>
      <Input id="organisme" value={form.organisme} onChange={onChange('organisme')} />
    </div>
  )}
  {shouldShowField('typeSiteDeux') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="typeSiteDeux">Type de site</Label>
      <Input id="typeSiteDeux" value={form.typeSiteDeux} onChange={onChange('typeSiteDeux')} />
    </div>
  )}
  {shouldShowField('ministereTutelle') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="ministereTutelle">Ministère de tutelle</Label>
      <Input
        id="ministereTutelle"
        value={form.ministereTutelle}
        onChange={onChange('ministereTutelle')}
      />
    </div>
  )}
  {shouldShowField('religion') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="religion">Religion</Label>
      <Input id="religion" value={form.religion} onChange={onChange('religion')} />
    </div>
  )}
  {coordinates && (
    <div className="flex flex-col gap-2">
      <Label>Coordonnées GPS</Label>
      <div className="flex gap-4">
        <div>
          <span className="text-muted-foreground">Latitude: </span>
          {coordinates.lat}
        </div>
        <div>
          <span className="text-muted-foreground">Longitude: </span>
          {coordinates.lng}
        </div>
      </div>
    </div>
  )}
</div>
</div>

        <DrawerFooter>
          <Button onClick={handleSave}>Enregistrer</Button>
          <DrawerClose asChild>
            <Button variant="outline">Annuler</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}