import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const city = searchParams.get('city'); // Optionnel, si on a juste le nom de la région

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    // Si la clé n'est pas configurée, on renvoie une erreur mock ou un message clair
    return NextResponse.json({ 
      error: "Clé API OpenWeatherMap manquante.",
      isMock: true,
      data: {
        temp: 24,
        humidity: 60,
        condition: 'Clear',
        description: 'Météo simulée (Clé manquante)'
      }
    }, { status: 200 });
  }

  try {
    let url = '';
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${apiKey}`;
    } else if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city},MG&units=metric&lang=fr&appid=${apiKey}`;
    } else {
      return NextResponse.json({ error: "Paramètres 'lat/lon' ou 'city' requis." }, { status: 400 });
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Erreur OpenWeatherMap" }, { status: response.status });
    }

    // Formater la réponse pour notre frontend
    const formattedData = {
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      condition: data.weather[0].main, // Rain, Clouds, Clear, etc.
      description: data.weather[0].description,
      windSpeed: data.wind.speed,
      cityName: data.name,
    };

    return NextResponse.json({ success: true, data: formattedData });

  } catch (error) {
    console.error("Erreur météo:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la récupération météo." }, { status: 500 });
  }
}
