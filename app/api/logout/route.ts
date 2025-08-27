import { NextResponse } from "next/server";

export async function POST() {
	const res = NextResponse.json({ success: true });
	
	// Supprimer le token d'authentification
	res.cookies.set("token", "", { httpOnly: true, path: "/", maxAge: 0 });
	
	// Supprimer les données utilisateur
	res.cookies.set("userData", "", { httpOnly: false, path: "/", maxAge: 0 });
	
	return res;
}