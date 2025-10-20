// lib/images.ts

import { Lieu } from "@/components/data-table";

// Chemin vers une image placée dans /public
export const NO_IMAGE = "/no-image.png";

// Tu peux en ajouter plusieurs si tu veux
export const NEXT_LOGO = "/next.svg";
export const FILE_ICON = "/file.svg";
export function normalizeImages(raw: unknown[]): string[] {
    if (!raw?.length) return [NO_IMAGE]
    const imgs = raw
      .map((img) => {
        const path =
          typeof img === "string" ? img : Object.values((img as Record<string, string>) || {}).join("")
        if (!path) return null
        if (path.startsWith("http")) return path
        const fileName = path.split(/[/\\]/).pop()
        return `http://localhost:3030/uploads/lieux/${fileName}`
      })
      .filter((v): v is string => !!v)
    return imgs.length ? imgs : [NO_IMAGE]
  }
  
  export function hasValidImages(lieu: Lieu): boolean {
    const images = normalizeImages(lieu.etabImages)
    return images.length > 0 && !images.includes(NO_IMAGE)
  }