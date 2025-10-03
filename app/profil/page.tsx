"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Mail, Save, Eye, EyeOff } from "lucide-react"
import { buildApiUrl } from "@/lib/config"


interface UserProfile {
  id?: string
  firstname?: string
  name?: string
  genre?: "masculin" | "feminin"
  email?: string
  avatar?: string
  role?: "utilisateur" | "gerant" | "admin"
  active?: boolean
  password?: string
  currentPassword?: string
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<UserProfile>({
    firstname: "",
    name: "",
    genre: "feminin",
    email: "",
    password: "••••••••",
    currentPassword: "",
  })
  const [user, setUser] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userData="))
        ?.split("=")[1]
      if (cookie) {
        const parsed = JSON.parse(decodeURIComponent(cookie))
        setUser(parsed || null)
        setFormData({
          ...parsed,
          password: "••••••••",
          currentPassword: "",
        })
      } else {
        setError("Aucune donnée d'utilisateur trouvée dans les cookies")
      }
    } catch (err) {
      setError("Erreur lors de la récupération des données des cookies")
      console.error("Erreur lors de la récupération des cookies:", err)
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      const updateData = {
        firstname: formData.firstname,
        name: formData.name,
        genre: formData.genre,
        email: formData.email,
        newPassword: formData.password !== "••••••••" ? formData.password : undefined,
        currentPassword: formData.currentPassword,
      }

      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([key, value]) => value !== undefined && value !== "")
      )

      if (Object.keys(filteredData).length === 0) {
        setIsEditing(false)
        return
      }

      console.log("Données envoyées à l'API:", filteredData) // Débogage
      const response = await fetch(buildApiUrl("/auth/update-profile") , {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(filteredData),
      })

      const responseText = await response.text() // Récupérer la réponse brute
      console.log("Réponse brute de l'API:", responseText) // Débogage
      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error("Réponse non valide: " + responseText)
      }

      if (response.ok) {
        setIsEditing(false)
        setUser(result.data.user)
        setFormData({ ...formData, password: "••••••••", currentPassword: "" })
        document.cookie = `userData=${encodeURIComponent(JSON.stringify(result.data.user))}; path=/`
      } else {
        setError(result.message || "Erreur lors de la mise à jour")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
      console.error("Erreur lors de la mise à jour du profil:", err)
    }
  }

  const displayName = `${formData.firstname || user?.firstname || "Invité"} ${
    formData.name || user?.name || ""
  }`.trim()
  const displayEmail = formData.email || user?.email || ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 md:p-8 mt-18">
      <div className="mx-auto max-w-4xl">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <Card className="mb-8 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 ring-4 ring-primary/20">
                  <AvatarImage
                    src={user?.avatar || "/professional-woman-portrait.png"}
                    alt="Photo de profil"
                  />
                  <AvatarFallback className="text-xl font-semibold bg-primary text-primary-foreground">
                    {(formData.firstname?.[0] || user?.firstname?.[0] || "I") +
                      (formData.name?.[0] || user?.name?.[0] || "N")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {displayEmail}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                {isEditing ? "Annuler" : "Modifier"}
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="text-sm font-medium text-foreground">
                  Prénom
                </Label>
                <Input
                  id="firstname"
                  value={formData.firstname || ""}
                  onChange={(e) => handleInputChange("firstname", e.target.value)}
                  disabled={!isEditing}
                  className="bg-input border-border focus:ring-primary/20"
                  placeholder="Votre prénom"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                  Nom
                </Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={!isEditing}
                  className="bg-input border-border focus:ring-primary/20"
                  placeholder="Votre nom"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre" className="text-sm font-medium text-foreground">
                  Genre
                </Label>
                <Select
                  value={formData.genre || "feminin"}
                  onValueChange={(value) => handleInputChange("genre", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="bg-input border-border focus:ring-primary/20">
                    <SelectValue placeholder="Sélectionnez votre genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculin">Masculin</SelectItem>
                    <SelectItem value="feminin">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  className="bg-input border-border focus:ring-primary/20"
                  placeholder="Votre adresse email"
                />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
                Mot de passe actuel (requis pour les changements sensibles)
              </Label>
              <Input
                id="currentPassword"
                type={showPassword ? "text" : "password"}
                value={formData.currentPassword || ""}
                onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                disabled={!isEditing}
                className="bg-input border-border focus:ring-primary/20"
                placeholder="Mot de passe actuel"
              />
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Nouveau mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={!isEditing}
                  className="bg-input border-border focus:ring-primary/20 pr-10"
                  placeholder="Nouveau mot de passe"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={!isEditing}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {isEditing && (
              <div className="mt-8 flex justify-end">
                <Button onClick={handleSave} className="gap-2 px-8">
                  <Save className="h-4 w-4" />
                  Sauvegarder les modifications
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}