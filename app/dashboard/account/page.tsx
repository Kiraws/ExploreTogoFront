"use client"

import { useState, useEffect } from "react"
import { motion,} from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { buildApiUrl } from "@/lib/config"
import { toast } from "sonner"
import {
  Mail,
  Save,
  Edit3,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from "lucide-react"

// ===== TYPES =====
type UserProfile = {
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

// ===== COMPOSANTS =====
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

// ===== PAGE PRINCIPALE =====
export default function AdminProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<UserProfile>({
    firstname: "",
    name: "",
    genre: "feminin",
    email: "",
    password: "••••••••",
    currentPassword: "",
  })

  // Récupération depuis le cookie
  useEffect(() => {
    try {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userData="))
        ?.split("=")[1]
      if (cookie) {
        const parsed = JSON.parse(decodeURIComponent(cookie))
        setUser(parsed)
        setFormData({ ...parsed, password: "••••••••", currentPassword: "" })
      } else {
        toast.error("Aucune donnée d'utilisateur trouvée dans les cookies")
      }
    } catch (err) {
      console.error("Erreur lors de la connexion :", err);
      toast.error("Erreur lors de la récupération des données des cookies")
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      const payload = {
        firstname: formData.firstname,
        name: formData.name,
        genre: formData.genre,
        email: formData.email,
        newPassword: formData.password !== "••••••••" ? formData.password : undefined,
        currentPassword: formData.currentPassword,
      }

      const filtered = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined && v !== ""))

      if (Object.keys(filtered).length === 0) {
        setIsEditing(false)
        return
      }

      const res = await fetch(buildApiUrl("/auth/update-profile"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(filtered),
      })

      const result = await res.json()
      if (res.ok) {
        setIsEditing(false)
        setUser(result.data.user)
        setFormData({ ...result.data.user, password: "••••••••", currentPassword: "" })
        document.cookie = `userData=${encodeURIComponent(JSON.stringify(result.data.user))}; path=/`
        toast.success("Profil mis à jour avec succès")
      } else {
        toast.error(result.message || "Erreur lors de la mise à jour")
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Erreur inconnue")
    }
  }

  const displayName = `${formData.firstname || user?.firstname || "Invité"} ${formData.name || user?.name || ""}`.trim()
  const displayEmail = formData.email || user?.email || ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 md:p-8 mt-18">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : profil */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm rounded-2xl p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 ring-4 ring-primary/20">
                <AvatarImage src={user?.avatar || "/professional-woman-portrait.png"} alt="Avatar" />
                <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                  {(formData.firstname?.[0] || user?.firstname?.[0] || "I") +
                    (formData.name?.[0] || user?.name?.[0] || "N")}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-bold">{displayName}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="size-4" />
                {displayEmail}
              </p>
              <Badge className="mt-2 capitalize">{user?.role || "utilisateur"}</Badge>
              <div className="mt-2 flex items-center gap-2 text-sm">
                {user?.active ? (
                  <>
                    <CheckCircle className="size-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">Actif</span>
                  </>
                ) : (
                  <>
                    <XCircle className="size-4 text-red-500" />
                    <span className="text-red-600 dark:text-red-400">Inactif</span>
                  </>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Genre</span>
                <span className="capitalize">{formData.genre || "Non spécifié"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs">{user?.id || "—"}</span>
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              className="w-full gap-2"
            >
              <Edit3 className="size-4" />
              {isEditing ? "Annuler" : "Modifier le profil"}
            </Button>
          </Card>
        </motion.div>

        {/* Colonne droite : formulaire */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm rounded-2xl p-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Prénom">
                  <Input
                    value={formData.firstname || ""}
                    onChange={(e) => handleInputChange("firstname", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Prénom"
                  />
                </Field>

                <Field label="Nom">
                  <Input
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Nom"
                  />
                </Field>

                <Field label="Genre">
                  <Select
                    value={formData.genre || "feminin"}
                    onValueChange={(val) => handleInputChange("genre", val)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculin">Masculin</SelectItem>
                      <SelectItem value="feminin">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Email">
                  <Input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Email"
                  />
                </Field>
              </div>

              <Separator />

              <Field label="Mot de passe actuel (requis pour les changements sensibles)">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.currentPassword || ""}
                    onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Mot de passe actuel"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>

              <Field label="Nouveau mot de passe (laisser vide pour ne pas changer)">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Nouveau mot de passe"
                />
              </Field>

              {isEditing && (
                <div className="flex justify-end">
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="size-4" />
                    Sauvegarder
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}