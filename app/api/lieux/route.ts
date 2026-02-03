import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Récupérer le token depuis les cookies côté serveur
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    // Appeler ton API externe avec le token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lieux`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      }
    });


    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: data.data || [],
      message: 'Lieux récupérés avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des lieux:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de la récupération des lieux' 
      },
      { status: 500 }
    )
  }
}
