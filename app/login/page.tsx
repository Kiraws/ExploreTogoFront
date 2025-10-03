import { LoginForm } from "@/components/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Connexion</h1>
          <p className="text-muted-foreground mt-2">Connectez-vous à votre compte</p>
        </div> */}
        <LoginForm />
        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            Vous n&apos;avez pas de compte ?{" "}
            <Link href="/register" className="text-primary hover:underline">
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
