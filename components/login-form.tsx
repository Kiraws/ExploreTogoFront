"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ValidationError {
  champ?: string;
  path?: string[];
  message: string;
}

export function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
    setFieldErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setFieldErrors({})

    try {
      console.log("Tentative de connexion vers /api/login...")
      
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      console.log("Réponse reçue:", response.status, response.statusText)
      
      const data = await response.json()
      console.log("Données reçues:", data)

      if (!response.ok) {
        if (response.status === 422 && data?.message_zod) {
          const newFieldErrors: Record<string, string> = {}
          data.message_zod.forEach((error: ValidationError) => {
            if (error.champ) {
              newFieldErrors[error.champ] = error.message
            }
          })
          setFieldErrors(newFieldErrors)
        } else if (response.status === 422 && data?.errors) {
          const newFieldErrors: Record<string, string> = {}
          data.errors.forEach((error: ValidationError) => {
            if (error.path && error.path[0]) {
              newFieldErrors[error.path[0]] = error.message
            }
          })
          setFieldErrors(newFieldErrors)
        } else {
          setError(data?.message || "Erreur lors de la connexion")
        }
        return
      }

      console.log("Connexion réussie, redirection...")
      
      // Rediriger selon le rôle si disponible
      if (data.user?.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Erreur lors de la connexion:", err)
      setError("Une erreur inattendue s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Se connecter</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="votre@email.com"
              className={fieldErrors.email ? "border-red-500" : ""}
            />
            {fieldErrors.email && <p className="text-sm text-red-500">{fieldErrors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Votre mot de passe"
              className={fieldErrors.password ? "border-red-500" : ""}
            />
            {fieldErrors.password && <p className="text-sm text-red-500">{fieldErrors.password}</p>}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}