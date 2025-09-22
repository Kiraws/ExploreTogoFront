import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  console.log('Token from API route:', token ? 'présent' : 'absent');

  if (!token) {
    return NextResponse.json({ message: 'No token provided' }, { status: 401 });
  }

  const formData = await req.formData();
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/lieux`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`, // Inclut le token dans l'en-tête
      },
      credentials: 'include', // Pour envoyer les cookies si nécessaire
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error proxying request:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}