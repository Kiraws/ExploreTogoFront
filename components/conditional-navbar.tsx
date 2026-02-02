"use client"

import { usePathname } from "next/navigation"
import { MainNavbar } from "./main-navbar"

const PAGES_WITHOUT_NAVBAR = ["/dashboard","/login","/register"]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ConditionalNavbar({ initialUser }: { initialUser?: any }) {
  const pathname = usePathname()

  const shouldShowNavbar = !PAGES_WITHOUT_NAVBAR.some((page) => pathname.startsWith(page))

  if (!shouldShowNavbar) {
    return null
  }

  return <MainNavbar initialUser={initialUser} />
}
