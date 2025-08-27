import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const userDataCookie = req.cookies.get("userData")?.value;
  const { pathname } = req.nextUrl;

  console.log(`Middleware: ${pathname}, Token: ${token ? 'présent' : 'absent'}, UserData: ${userDataCookie ? 'présent' : 'absent'}`);

  // Pages publiques - accessibles sans connexion
  const publicPages = ["/", "/login", "/register"];
  
  // Routes API à ignorer (gérées par les route handlers)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Si on est sur une page publique
  if (publicPages.includes(pathname)) {
    // Ajout : Si connecté et sur /login ou /register, rediriger selon rôle
    if (token && userDataCookie && (pathname === "/login" || pathname === "/register")) {
      try {
        const userData = JSON.parse(userDataCookie);
        const role = userData.role;
        const url = req.nextUrl.clone();
        if (role === "admin") {
          url.pathname = "/dashboard";
        } else {
          url.pathname = "/"; // Ou "/" pour user, ajuste selon besoin
        }
        return NextResponse.redirect(url);
      } catch (error) {
        console.error("Erreur parsing userData:", error);
        // En cas d'erreur, rediriger vers la page d'accueil
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }

    // Si connecté et sur la page racine, rediriger l'admin vers /dashboard
    if (token && userDataCookie && pathname === "/") {
      try {
        const userData = JSON.parse(userDataCookie);
        if (userData.role === "admin") {
          const url = req.nextUrl.clone();
          url.pathname = "/dashboard";
          return NextResponse.redirect(url);
        }
      } catch (error) {
        // ignorer et continuer
      }
    }

    return NextResponse.next();
  }

  // Pour toutes les autres pages, vérifier qu'il y a un token ET des données utilisateur
  if (!token || !userDataCookie) {
    console.log("Token ou données utilisateur manquants, redirection vers /login");
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname); // Pour revenir après login
    return NextResponse.redirect(url);
  }

  // Récupérer le rôle depuis les données utilisateur
  let role: string | undefined;
  try {
    const userData = JSON.parse(userDataCookie);
    role = userData.role;
  } catch (error) {
    console.error("Erreur parsing userData:", error);
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!role) {
    // Si rôle non trouvé dans les données utilisateur, traiter comme non autorisé
    console.log("Rôle non trouvé dans les données utilisateur, redirection vers /login");
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Définir les pages autorisées par rôle (configurable ici)
  const userPages = ["/", "/profile", "/user/settings"]; // Exemples pour rôle "user" - ajoute tes pages
  const adminPages = ["/dashboard", "/admin/users", "/admin/products"]; // Exemples pour rôle "admin" - ajoute tes pages

  // Logique de redirection basée sur rôle, similaire à NextAuth
  if (role === "user") {
    // User ne peut pas accéder à /dashboard ni à ses sous-pages
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
      console.log("User essaie d'accéder à une page admin, redirection vers /");
      const url = req.nextUrl.clone();
      url.pathname = "/"; // Ou une page user par défaut
      return NextResponse.redirect(url);
    }
    // User peut accéder à / si connecté (selon ta spec initiale)
    if (pathname === "/" || userPages.includes(pathname)) {
      return NextResponse.next();
    }
    // Si page non autorisée pour user, rediriger
    console.log("Page non autorisée pour user, redirection vers /");
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (role === "admin") {
    // Admin ne peut pas accéder à / si connecté
    if (pathname === "/") {
      console.log("Admin sur /, redirection vers /dashboard");
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      // Pas de paramètre login=success
      return NextResponse.redirect(url);
    }
    // Admin ne peut pas accéder aux pages user spécifiques (si exclusives)
    if (userPages.includes(pathname)) {
      console.log("Admin essaie d'accéder à une page user, redirection vers /dashboard");
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    // Admin peut accéder à toutes les routes sous /dashboard
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
      return NextResponse.next();
    }
    // Si page non autorisée pour admin, rediriger
    console.log("Page non autorisée pour admin, redirection vers /dashboard");
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Par défaut, si rôle inconnu, rediriger
  console.log("Rôle inconnu, redirection vers /login");
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Exclure les fichiers statiques et API routes
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};