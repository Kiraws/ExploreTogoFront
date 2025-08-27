import { RegistrationForm } from "@/components/registration-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Inscription</h1>
          <p className="text-muted-foreground mt-2">Créez votre compte</p>
        </div>
        <RegistrationForm />
        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
