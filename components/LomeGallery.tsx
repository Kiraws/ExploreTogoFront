"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Masonry from "react-responsive-masonry"

const IMAGES = [
  { src: "/lome/01-marche.jpg", alt: "Marché de Lomé" },
  { src: "/lome/02-plage.jpg", alt: "Plage de Lomé" },
  { src: "/lome/03-catho.jpg", alt: "Cathédrale du Sacré-Cœur" },
  { src: "/lome/04-rue.jpg", alt: "Rue animée" },
  { src: "/lome/05-phare.jpg", alt: "Phare de Lomé" },
  { src: "/lome/06-vendeuse.jpg", alt: "Vendeuse de légumes" },
  { src: "/lome/07-lagune.jpg", alt: "Lagune Hote Napoléeon de Lomé" },
  { src: "/lome/08-night.jpg", alt: "Nuit à Lomé" },
  { src: "/lome/09-art.jpg", alt: "Gallerie d'art" },
  { src: "/lome/10-pirogue.jpg", alt: "Pirogue au coucher du soleil" },
]

export default function LomeGallery() {
  return (
    <section className="container mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold mb-2">Lomé en images</h2>
        <p className="text-muted-foreground">Un aperçu visuel de la capitale.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <Masonry
          columnsCountBreakPoints={{ 320: 2, 640: 3, 1024: 5 }}
          gutter="0.5rem"
        >
          {IMAGES.map((img, idx) => (
            <motion.div
              key={img.src}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ scale: 1.01 }}
              className="relative rounded-2xl overflow-hidden shadow-lg"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={800}
                height={600}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-2 left-3 text-white text-sm font-medium">
                {img.alt}
              </div>
            </motion.div>
          ))}
        </Masonry>
      </motion.div>
    </section>
  )
}