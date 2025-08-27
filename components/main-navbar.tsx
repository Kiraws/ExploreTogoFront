"use client"

import { Button } from "@/components/ui/button";
import { Logo } from "./navbar-04/logo";
import { NavMenu } from "./navbar-04/nav-menu";
import { NavigationSheet } from "./navbar-04/navigation-sheet";
import { ThemeSelector } from "./theme-selector";
import { ModeToggle } from "./ui/mode-toogle";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";

interface SessionUser {
  id?: string;
  name?: string;
  firstname?: string;
  role?: string;
  email?: string;
  avatar?: string;
}

export function MainNavbar({ initialUser }: { initialUser?: SessionUser | null }) {
  const [user, setUser] = useState<SessionUser | null>(initialUser ?? null);

  useEffect(() => {
    try {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userData="))
        ?.split("=")[1];
      if (!cookie) {
        setUser(null);
        return;
      }
      const parsed = JSON.parse(decodeURIComponent(cookie));
      setUser(parsed || null);
    } catch {
      setUser(null);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <nav className="fixed top-6 inset-x-4 h-16 bg-background border dark:border-slate-700/70 max-w-screen-xl mx-auto rounded-full z-50">
      <div className="h-full flex items-center justify-between mx-auto px-4">
        <Logo />

        {/* Desktop Menu */}
        <NavMenu className="hidden md:block" />

        <div className="flex items-center gap-3">
          {/* Theme Selector et Mode Toggle */}
          <div className="flex items-center gap-2">
            <ThemeSelector />
            <ModeToggle />
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:outline-none" title={user.firstname || user.name || user.email}>
                  <Avatar className="h-11 w-11 ring-2 ring-foreground/15 hover:ring-foreground/25 transition">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.firstname || user.name || "Avatar"} />
                    ) : null}
                    <AvatarFallback className="flex items-center justify-center bg-foreground/5 text-muted-foreground">
                      <UserIcon className="" size={20} />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-56 rounded-lg">
                <DropdownMenuLabel>
                  {user.firstname || user.name} {user.email ? `· ${user.email}` : ""}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profil">Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Se déconnecter</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="hidden sm:inline-flex rounded-full">
                  Se connecter
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full">S&apos;inscrire</Button>
              </Link>
            </>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
}
