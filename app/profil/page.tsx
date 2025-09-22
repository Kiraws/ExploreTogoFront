"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Mail, Save, Eye, EyeOff } from "lucide-react"

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "Alexa",
        lastName: "Rawles",
        gender: "Femme",
        email: "alexarawles@gmail.com",
        password: "••••••••",
    })

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSave = () => {
        setIsEditing(false)
        // Ici vous pourriez ajouter la logique pour sauvegarder les données
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 md:p-8 mt-18">
            <div className="mx-auto max-w-4xl">
                {/* Header Section */}
                <Card className="mb-8 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20 ring-4 ring-primary/20">
                                    <AvatarImage src="/professional-woman-portrait.png" alt="Photo de profil" />
                                    <AvatarFallback className="text-xl font-semibold bg-primary text-primary-foreground">
                                        {formData.firstName[0]}
                                        {formData.lastName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground">
                                        {formData.firstName} {formData.lastName}
                                    </h1>
                                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                                        <Mail className="h-4 w-4" />
                                        {formData.email}
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

                {/* Information Fields */}
                <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Prénom */}
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                                    Prénom
                                </Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                                    disabled={!isEditing}
                                    className="bg-input border-border focus:ring-primary/20"
                                    placeholder="Votre prénom"
                                />
                            </div>

                            {/* Nom */}
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                                    Nom
                                </Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                                    disabled={!isEditing}
                                    className="bg-input border-border focus:ring-primary/20"
                                    placeholder="Votre nom"
                                />
                            </div>

                            {/* Genre */}
                            <div className="space-y-2">
                                <Label htmlFor="gender" className="text-sm font-medium text-foreground">
                                    Genre
                                </Label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value) => handleInputChange("gender", value)}
                                    disabled={!isEditing}
                                >
                                    <SelectTrigger className="bg-input border-border focus:ring-primary/20">
                                        <SelectValue placeholder="Sélectionnez votre genre" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Homme">Homme</SelectItem>
                                        <SelectItem value="Femme">Femme</SelectItem>
                                        <SelectItem value="Non-binaire">Non-binaire</SelectItem>
                                        <SelectItem value="Préfère ne pas dire">Préfère ne pas dire</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    disabled={!isEditing}
                                    className="bg-input border-border focus:ring-primary/20"
                                    placeholder="Votre adresse email"
                                />
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                Mot de passe
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => handleInputChange("password", e.target.value)}
                                    disabled={!isEditing}
                                    className="bg-input border-border focus:ring-primary/20 pr-10"
                                    placeholder="Votre mot de passe"
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

                        {/* Save Button */}
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
