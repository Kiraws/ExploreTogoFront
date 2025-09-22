"use client"

import { useEffect, useState } from "react"
import { UserDataTable, User } from "@/components/UserDataTable"
import { buildApiUrl } from "@/lib/config"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/users'), {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ''}`,
          },
        })

        // Vérifier le type de contenu
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          throw new Error(`Réponse non-JSON reçue (statut ${response.status}): ${text.slice(0, 100)}...`)
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Erreur ${response.status}`)
        }

        const result = await response.json()
        
        if (result.status === "Succès") {
          console.log('API Response:', result.data) // Debug log
          setUsers(result.data)
        } else {
          throw new Error(result.message || "Erreur lors de la récupération des données")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
        console.error("Erreur fetchUsers:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Chargement des utilisateurs...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Erreur: {error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <UserDataTable data={users} />
        </div>
      </div>
    </div>
  )
}