"use client"

import { useToast } from "@/hooks/use-toast"
import { Toast } from "./toast"
import { AnimatePresence, motion } from "framer-motion"

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.5 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Toast
              variant={toast.variant}
              onClose={() => removeToast(toast.id)}
            >
              <div className="flex flex-col gap-1">
                <div className="font-semibold">{toast.title}</div>
                {toast.description && (
                  <div className="text-sm opacity-90">{toast.description}</div>
                )}
              </div>
            </Toast>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
