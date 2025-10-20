"use client"

import { useState, useCallback } from "react"

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive" | "success"
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])

    // Auto-remove toast after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback((title: string, description?: string) => {
    return addToast({ title, description, variant: "success" })
  }, [addToast])

  const error = useCallback((title: string, description?: string) => {
    return addToast({ title, description, variant: "destructive" })
  }, [addToast])

  const info = useCallback((title: string, description?: string) => {
    return addToast({ title, description, variant: "default" })
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
  }
}


