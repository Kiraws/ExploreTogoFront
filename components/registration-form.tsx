"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios, { AxiosError } from "axios"

export function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    firstname: "",
    genre: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [apiError, setApiError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setPasswordError("")
    setApiError("")
    setFieldErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setPasswordError("")
    setApiError("")

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    try {
      // URL corrigée pour pointer vers le port 3030
      const response = await axios.post("http://localhost:3030/auth/register", {
        name: formData.name,
        firstname: formData.firstname,
        genre: formData.genre,
        email: formData.email,
        password: formData.password,
      })
      console.log("Inscription réussie:", response.data)
      window.location.href = "/login"
    } catch (err) {
      if (err instanceof AxiosError) {
        const errorData = err.response?.data
        
        // Gestion des erreurs spécifiques selon votre API
        if (err.response?.status === 422 && errorData?.message_zod) {
          // Erreurs de validation Zod
          const newFieldErrors: Record<string, string> = {}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          errorData.message_zod.forEach((error: any) => {
            newFieldErrors[error.champ] = error.message
          })
          setFieldErrors(newFieldErrors)
        } else if (err.response?.status === 422 && errorData?.errors) {
          // Erreurs de validation standard
          const newFieldErrors: Record<string, string> = {}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          errorData.errors.forEach((error: any) => {
            if (error.path) {
              newFieldErrors[error.path[0]] = error.message
            }
          })
          setFieldErrors(newFieldErrors)
        } else if (err.response?.status === 400 && errorData?.message === "Cet email est déjà utilisé") {
          setFieldErrors({ email: "Cet email est déjà utilisé" })
        } else {
          // Autres erreurs (500, etc.)
          setApiError(errorData?.message || "Erreur lors de l'inscription")
        }
      } else {
        setApiError("Une erreur inattendue s'est produite")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      {/* <CardHeader>
        <CardTitle>Formulaire d&apos;inscription</CardTitle>
      </CardHeader> */}
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                type="text"
                placeholder="Votre nom"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className={fieldErrors.name ? "border-red-500" : ""}
              />
              {fieldErrors.name && <p className="text-sm text-red-500">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstname">Prénom</Label>
              <Input
                id="firstname"
                type="text"
                placeholder="Votre prénom"
                value={formData.firstname}
                onChange={(e) => handleInputChange("firstname", e.target.value)}
                required
                className={fieldErrors.firstname ? "border-red-500" : ""}
              />
              {fieldErrors.firstname && <p className="text-sm text-red-500">{fieldErrors.firstname}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Select onValueChange={(value) => handleInputChange("genre", value)}>
                <SelectTrigger className={fieldErrors.genre ? "border-red-500" : ""}>
                  <SelectValue placeholder="Choisissez votre genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculin">Homme</SelectItem>
                  <SelectItem value="feminin">Femme</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.genre && <p className="text-sm text-red-500">{fieldErrors.genre}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@exemple.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className={fieldErrors.email ? "border-red-500" : ""}
              />
              {fieldErrors.email && <p className="text-sm text-red-500">{fieldErrors.email}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="Votre mot de passe"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
              className={fieldErrors.password ? "border-red-500" : ""}
            />
            {fieldErrors.password && <p className="text-sm text-red-500">{fieldErrors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirmez votre mot de passe"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              required
              className={passwordError ? "border-red-500" : ""}
            />
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            {apiError && <p className="text-sm text-red-500">{apiError}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}