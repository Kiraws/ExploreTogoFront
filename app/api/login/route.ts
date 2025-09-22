import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const body = await req.json();

	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		const data = await res.json();

		if (!res.ok) {
			return NextResponse.json(data, { status: res.status });
		}

		const accessToken = data?.accessToken;
		if (!accessToken) {
			return NextResponse.json({ message: "Token manquant dans la réponse." }, { status: 500 });
		}

		const response = NextResponse.json({ 
			success: true,
			user: data.user ?? null,
			token:accessToken 
		});
		
		// Stocker le token d'authentification
		response.cookies.set("token", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24 * 7, // 7 jours
		});
		
		// Stocker les données utilisateur (y compris le rôle) pour le middleware
		if (data.user) {
			response.cookies.set("userData", JSON.stringify(data.user), {
				httpOnly: false, // Accessible côté client et middleware
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
				maxAge: 60 * 60 * 24 * 7, // 7 jours
			});
		}
		
		return response;
	} catch (e) {
		return NextResponse.json({ message: "Erreur de connexion au serveur d'auth." }, { status: 502 });
	}
}