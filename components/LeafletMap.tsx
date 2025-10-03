"use client"

import { useEffect, useRef } from "react"
import "leaflet/dist/leaflet.css"
import type { Map as LeafletMapType } from "leaflet"

interface LeafletMapProps {
  latitude: number
  longitude: number
  placeName: string
}

export default function LeafletMap({ latitude, longitude, placeName }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<LeafletMapType | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const initMap = async () => {
      const L = await import("leaflet")

      const customIcon = L.icon({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current!).setView([latitude, longitude], 15)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstanceRef.current)

        markerRef.current = L.marker([latitude, longitude], { icon: customIcon }).addTo(mapInstanceRef.current)
        markerRef.current.bindPopup(`<b>${placeName}</b>`).openPopup()
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 15)
      markerRef.current.setLatLng([latitude, longitude])
      markerRef.current.setPopupContent(`<b>${placeName}</b>`).openPopup()
    }
  }, [latitude, longitude, placeName])

  return <div ref={mapRef} className="h-[300px] w-full rounded-xl overflow-hidden border" />
}
