import { NO_IMAGE } from "@/lib/images" 


export function translateType(type: string): string {
  const translations: Record<string, string> = {
    hotels: "Hotels",
    supermarches: "Supermarché/Mall",
    parcs: "Parcs/Jardins",
    loisirs: "Loisirs",
    marches: "Marchés",
    sites: "Sites Naturels",
    zones: "Zones Protégées",
    touristique: "Sites touristiques",
  }
  return translations[type] || type.charAt(0).toUpperCase() + type.slice(1)
}

export function getTypeIcon(type: string) {
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

export function normalizeImages(rawImages: (string | Record<string, string>)[] | undefined): string[] {
  if (!rawImages || rawImages.length === 0) return [NO_IMAGE]

  const processedImages = rawImages
    .map((img) => reconstructImagePath(img))
    .filter((img): img is string => img !== null)

  return processedImages.length > 0 ? processedImages : [NO_IMAGE]
}

export function extractCoordinates(geometry: string) {
  if (geometry.includes("POINT")) {
    const match = geometry.match(/POINT $$([^$$]+)\)/)
    if (match && match[1]) {
      const [lng, lat] = match[1].split(" ").map(Number)
      return { lat, lng }
    }
  }
  return null
}

function reconstructImagePath(image: string | Record<string, string>): string | null {
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