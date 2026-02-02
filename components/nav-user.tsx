"use client"

import {
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface SessionUser {
  id?: string
  name?: string
  firstname?: string
  role?: string
  email?: string
  avatar?: string
}

export function NavUser({
  user,
}: {
  user?: SessionUser
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()

  const [sessionUser, setSessionUser] = useState<SessionUser | null>(user ?? null)

  useEffect(() => {
    try {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userData="))
        ?.split("=")[1]
      if (!cookie) {
        setSessionUser(null)
        return
      }
      const parsed = JSON.parse(decodeURIComponent(cookie))
      setSessionUser(parsed || null)
    } catch {
      setSessionUser(null)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" })
    } catch (e) {
      // ignore
      console.error("Erreur lors de la déconnexion :", e);
    } finally {
      router.push("/login")
    }
  }

  const displayName = sessionUser?.firstname || sessionUser?.name || "Invité"
  const displayEmail = sessionUser?.email || ""

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                {sessionUser?.avatar ? (
                  <AvatarImage src={sessionUser.avatar} alt={displayName} />
                ) : null}
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {displayEmail}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {sessionUser?.avatar ? (
                    <AvatarImage src={sessionUser.avatar} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {displayEmail}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sessionUser ? (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <IconUserCircle />
                    Account
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>
                    <IconCreditCard />
                    Billing
                  </DropdownMenuItem> */}
                  <DropdownMenuItem>
                    <IconNotification />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <IconLogout />
                  Log out
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => router.push("/login")}>
                <IconUserCircle />
                Se connecter
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}