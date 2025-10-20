"use client"

import { motion } from "framer-motion"
import { IconBrandGithub, IconRocket, IconMap, IconDeviceMobile, IconRobot, IconChartBar } from "@tabler/icons-react"

const togolaisColors = {
  green: "#006A4E",
  yellow: "#FFCE00",
  red: "#D21034",
  white: "#FFFFFF",
}

// Timeline data remains the same
const timeline = [
  { date: "17 Juin 2023", title: "Lancement du projet", description: "Sélection par Open Data Science" },
  { date: "Phase 1", title: "8 catégories", description: "Loisirs, hôtels, marchés, parcs..." },
  { date: "Phase 2", title: "Expansion", description: "Nouvelles catégories et gestion des espaces" },
  { date: "Phase 3", title: "Mobile & IA", description: "Application mobile et chatbot avancé" },
]

// Features for current version
const currentFeatures = [
  { icon: IconMap, title: "Exploration territoriale", description: "Découverte des lieux sur tout le territoire" },
  { icon: IconChartBar, title: "Filtres avancés", description: "Recherche multicritères personnalisée" },
  { icon: IconRobot, title: "Chatbot IA", description: "Assistant intelligent en développement" },
]

// Future features
const futureFeatures = [
  { title: "Nouvelles Catégories", items: ["Entreprises", "Banques", "Écoles", "Centres de santé"] },
  { title: "Gestion d'Espace", items: ["Création de profil", "Gestion des réservations", "Photos et menus"] },
  { title: "Technologies Avancées", items: ["Recherche par image", "Application mobile", "Chatbot amélioré"] },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold">
              À Propos d'<span style={{ color: togolaisColors.green }}>ExploreTg</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Une initiative Open Data Science pour découvrir les{" "}
              <span style={{ color: togolaisColors.yellow }} className="font-medium">
                richesses du Togo
              </span>
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Notre Parcours</h2>
          <div className="max-w-3xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex gap-4 mb-8"
              >
                <div className="w-32 pt-2 text-sm text-muted-foreground">{item.date}</div>
                <div 
                  className="flex-1 pl-6 pb-8 relative"
                  style={{ borderLeft: `2px solid ${togolaisColors.green}30` }}
                >
                  <div 
                    className="absolute -left-1.5 top-3 w-3 h-3 rounded-full"
                    style={{ backgroundColor: togolaisColors.green }}
                  />
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Fonctionnalités Actuelles</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {currentFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center p-6 rounded-2xl bg-card shadow-lg"
                style={{ boxShadow: `0 4px 6px -1px ${togolaisColors.green}10` }}
              >
                <feature.icon 
                  className="size-12 mx-auto mb-4"
                  style={{ color: togolaisColors.green }}
                />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Prochaines Étapes</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {futureFeatures.map((category, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="p-6 rounded-2xl bg-card shadow-lg"
              >
                <h3 className="font-semibold text-lg mb-4 text-center">{category.title}</h3>
                <ul className="space-y-2">
                  {category.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <IconRocket 
                        className="size-4"
                        style={{ color: togolaisColors.yellow }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <IconBrandGithub 
              className="size-16 mx-auto"
              style={{ color: togolaisColors.green }}
            />
            <h2 className="text-3xl font-bold">
              Projet <span style={{ color: togolaisColors.yellow }}>Open Source</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ExploreTg est un projet open source. Rejoignez-nous pour contribuer à son développement !
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
