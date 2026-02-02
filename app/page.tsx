"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tiles } from "@/components/tiles"
import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useState } from "react"
import {
  IconCompass,
  IconChevronsDown, IconMail, IconBrandInstagram,
  IconBrandTwitter, IconBrandGithub
} from "@tabler/icons-react"
import LomeGallery from "@/components/LomeGallery"
import StatsLieux from "@/components/StatsLieux"

/* -------------------------------------------------- */
/*  CONFIG                                            */
/* -------------------------------------------------- */
const CATEGORIES = [
  { name: "Hôtels", icon: "🏨", slug: "hotels" },
  { name: "Marchés", icon: "🛍️", slug: "marches" },
  { name: "Supermarchés", icon: "🛒", slug: "supermarches" },
  { name: "Parcs & Jardins", icon: "🌳", slug: "parcs" },
  { name: "Sites naturels", icon: "🏞️", slug: "sites" },
  { name: "Loisirs", icon: "🎉", slug: "loisirs" },
  { name: "Touristique", icon: "📸", slug: "touristique" },
  { name: "Zones protégées", icon: "🛡️", slug: "zones" },
]

const REGIONS = [
  { id: "maritime", name: "Maritime", coords: "215,320,260,280,310,300,300,350,250,370" },
  { id: "plateaux", name: "Plateaux", coords: "300,250,380,240,400,300,360,340,300,320" },
  { id: "centrale", name: "Centrale", coords: "280,180,340,170,360,220,320,240,270,220" },
  { id: "kara", name: "Kara", coords: "320,100,400,90,420,150,380,170,310,160" },
  { id: "savanes", name: "Savanes", coords: "380,50,480,40,500,120,440,140,360,130" },
]

const STATS = [
  { label: "Régions", value: 5 },
  { label: "Préfectures", value: 39 },
  { label: "Communes", value: 117 },
  { label: "Cantons", value: 387 },
  { label: "Localités", value: 7798 },
]

/* -------------------------------------------------- */
/*  COMPOSANTS                                        */
/* -------------------------------------------------- */
function AnimatedCounter({ to }: { to: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const duration = 1500
    const step = (t: number) => {
      const progress = t / duration
      setCount(Math.min(Math.floor(progress * to), to))
    }
    const id = setInterval(() => {
      start += 16
      step(start)
      if (start >= duration) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [to])
  return <span>{count.toLocaleString()}</span>
}

function TogoMiniMap() {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <svg viewBox="0 0 600 450" className="w-full h-full max-h-96 drop-shadow-lg">
      <image href="/togo-blank.png" width="600" height="450" className="opacity-10" />
      {REGIONS.map((r) => (
        <g key={r.id}>
          <path
            d={`M${r.coords}Z`}
            fill={hovered === r.id ? "#FFCE00" : "#006A4E"}
            stroke="#fff"
            strokeWidth="2"
            className="transition-colors cursor-pointer"
            onMouseEnter={() => setHovered(r.id)}
            onMouseLeave={() => setHovered(null)}
          />
          {hovered === r.id && (
            <text x="300" y="50" textAnchor="middle" className="fill-foreground text-lg font-semibold">
              {r.name}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

/* -------------------------------------------------- */
/*  PAGE                                              */
/* -------------------------------------------------- */
export default function Home() {
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <>
      {/* HERO */}
   {/* HERO */}
   <motion.section
  style={{ opacity: heroOpacity }}
  className="relative h-screen flex items-center justify-center text-center px-6 overflow-hidden group "
>
  <AnimatedGridBackgroundSection>
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="space-y-6 max-w-4xl"
    >
      <h1 className="text-6xl md:text-7xl font-extrabold text-[#006A4E] dark:text-[#FFCE00] drop-shadow-xl">
        Découvrir le <span className="text-[#D21034]">Togo</span> autrement
      </h1>
      <p className="text-xl text-[#006A4E]/80 dark:text-[#FFCE00]/80">
        Tous les lieux de loisirs, hôtels, marchés, parcs, sites naturels… <br />
        <strong className="text-[#D21034]">par région, commune, canton, localité.</strong>
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/explore">
          <Button className="bg-gradient-to-r from-[#006A4E] to-[#006A4E]/80 hover:from-[#006A4E]/90 hover:to-[#006A4E]/70 text-white shadow-lg rounded-full gap-2">
            <IconCompass className="size-5" /> Commencer l&apos;exploration
          </Button>
        </Link>
      </div>
    </motion.div>

    <motion.div
      animate={{ y: [0, 8, 0] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="absolute bottom-8 text-[#006A4E] dark:text-[#FFCE00]"
    >
      <IconChevronsDown className="size-7" />
    </motion.div>
  </AnimatedGridBackgroundSection>
</motion.section>


      {/* CARTE + STATS */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div className="space-y-4">
            <h2 className="text-4xl font-bold text-[#006A4E] dark:text-[#FFCE00]">Tout le territoire togolais</h2>
            <p className="text-muted-foreground">
              Du Maritime aux Savanes, en passant par les Plateaux, la Centrale et le Kara,
              retrouvez les lieux triés par <strong>région, préfecture, commune, canton et localité</strong>.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              {STATS.map((s) => (
                <div key={s.label} className="p-4 rounded-xl bg-white/60 dark:bg-gray-800/30 backdrop-blur-sm shadow border border-white/30">
                  <div className="text-3xl font-extrabold text-[#006A4E] dark:text-[#FFCE00]">
                    <AnimatedCounter to={s.value} />
                  </div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="h-80 md:h-96">
            <TogoMiniMap />
          </motion.div>
        </div>
      </section>

      {/* CATÉGORIES */}
      <section className="container mx-auto px-6 py-24">
        <motion.div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#006A4E] dark:text-[#FFCE00]">Explorer par catégorie</h2>
          {/* <p className="text-muted-foreground">Cliquez sur une catégorie pour voir les lieux correspondants.</p> */}
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, idx) => (
            <motion.div key={cat.slug} transition={{ delay: idx * 0.05 }}>
              <Link href={`/explore?cat=${cat.slug}`}>
                <div className="group flex flex-col items-center p-6 bg-white/60 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl shadow border border-white/30 hover:shadow-lg transition cursor-pointer h-full">
                  <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="font-semibold text-center text-[#006A4E] dark:text-[#FFCE00]">{cat.name}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <LomeGallery />
      </section>

      {/* Statistiques et ou graphes, shemas à propos des données*/}
      <StatsLieux /> 


      {/* CTA FINALE */}
      <section className="container mx-auto px-6 py-24 text-center">
        <motion.div className="space-y-6">
          <h2 className="text-4xl font-bold text-[#006A4E] dark:text-[#FFCE00]">Prêt à explorer ?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Rejoignez des milliers de personnes qui découvrent le Togo chaque jour.
          </p>
          <Link href="/explore">
            <Button className="bg-gradient-to-r from-[#006A4E] to-[#006A4E]/80 hover:from-[#006A4E]/90 hover:to-[#006A4E]/70 text-white shadow-lg rounded-full">
              Explorer maintenant
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#006A4E]/5 dark:bg-gray-900/30 backdrop-blur-sm border-t border-[#006A4E]/20">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="text-xl font-bold text-[#006A4E] dark:text-[#FFCE00]">ExploreTg</div>
              <p className="text-sm text-muted-foreground">
                Le guide complet des lieux remarquables du Togo.
              </p>
            </div>
            <div>
              <div className="font-semibold mb-3 text-[#006A4E] dark:text-[#FFCE00]">Explorer</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/explore">Tous les lieux</Link></li>
                <li><Link href="/categories">Catégories</Link></li>
                <li><Link href="/carte">Carte</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-3 text-[#006A4E] dark:text-[#FFCE00]">À propos</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/a-propos">Qui sommes-nous ?</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/api">API</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-3 text-[#006A4E] dark:text-[#FFCE00]">Newsletter</div>
              <p className="text-sm text-muted-foreground mb-3">
                Recevez les nouveaux lieux par e-mail.
              </p>
              <form className="flex gap-2">
                <Input placeholder="Votre e-mail" type="email" required className="bg-white/50 dark:bg-gray-800/50 border-white/30" />
                <Button className="bg-[#006A4E] hover:bg-[#006A4E]/90 text-white">
                  <IconMail className="size-4" />
                </Button>
              </form>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center mt-10 pt-6 border-t border-[#006A4E]/20 text-sm text-muted-foreground">
            <div>© {new Date().getFullYear()} ExploreTg – Tous droits réservés</div>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <IconBrandInstagram className="size-5 hover:text-[#006A4E] transition" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                <IconBrandTwitter className="size-5 hover:text-[#006A4E] transition" />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <IconBrandGithub className="size-5 hover:text-[#006A4E] transition" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

const AnimatedGridBackgroundSection: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-full h-full min-h-[400px] relative overflow-hidden flex items-center justify-center">
      <div className="relative z-[2] w-full h-full flex items-center justify-center">{children}</div>
      <div className="absolute inset-0 z-[1] group-hover:opacity-100 transition-opacity duration-50">
        <Tiles rows={30} cols={20} />
      </div>
    </div>
  )
}
