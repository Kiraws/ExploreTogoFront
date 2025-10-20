// lib/useLieux.ts
import { useEffect, useState } from "react"
import { buildApiUrl } from "@/lib/config"
import type { Lieu } from "@/components/data-table"

export function useLieux() {
  const [lieux, setLieux] = useState<Lieu[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(buildApiUrl("/api/lieux"), {
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    })
      .then((r) => r.json())
      .then((d) => (d.success ? setLieux(d.data) : console.error(d.message)))
      .finally(() => setLoading(false))
  }, [])

  return { lieux, loading }
}