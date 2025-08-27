import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Bienvenue</h1>
          <p className="text-muted-foreground text-lg">Choisissez une option pour continuer</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">S&apos;inscrire</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
