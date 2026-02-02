"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"

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
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation côté client
    if (!formData.email || !formData.password) {
      toast.error("Veuillez remplir tous les champs")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Gestion des erreurs de validation
        if (response.status === 422 && data?.message_zod) {
          const errors = data.message_zod.map((err: ValidationError) => 
            `${err.champ || err.path?.[0]} : ${err.message}`
          ).join("\n")
          toast.error(`Erreur de validation :\n${errors}`)
        } else if (response.status === 401) {
          toast.error("Email ou mot de passe incorrect")
        } else {
          toast.error(data?.message || "Erreur lors de la connexion")
        }
        return
      }

      // Succès
      if (data?.token) {
        localStorage.setItem("token", data.token)
        toast.success("Connexion réussie !")
        
        // Redirection selon le rôle
        setTimeout(() => {
          if (data.user?.role === "admin") {
            router.push("/dashboard")
          } else {
            router.push("/")
          }
        }, 1000)
      }
    } catch (err) {
      toast.error("Une erreur inattendue s'est produite")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-card/80 backdrop-blur-sm rounded-2xl">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <CardTitle className="text-2xl font-bold">Bienvenue</CardTitle>
            <p className="text-muted-foreground">Connectez-vous à votre compte</p>
          </motion.div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="size-4" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                className="pl-10"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="size-4" />
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Votre mot de passe"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}