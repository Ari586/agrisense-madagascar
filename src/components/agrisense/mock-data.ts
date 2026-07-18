export const weatherAlerts = [
  {
    id: 1,
    type: "cyclone" as const,
    severity: "critical" as const,
    title: "Alerte Cyclone",
    message:
      "Risque de cyclone dans 72h sur la côte Est. Protégez vos cultures.",
    region: "Côte Est",
    time: "Il y a 2h",
  },
  {
    id: 2,
    type: "drought" as const,
    severity: "warning" as const,
    title: "Sécheresse",
    message: "Période sèche prolongée dans le Sud. Réduisez l'irrigation.",
    region: "Sud",
    time: "Il y a 5h",
  },
  {
    id: 3,
    type: "rain" as const,
    severity: "info" as const,
    title: "Pluies attendues",
    message:
      "Pluies modérées prévues dans 48h dans les Hauts Plateaux.",
    region: "Hauts Plateaux",
    time: "Il y a 8h",
  },
];

export const marketPrices = [
  { crop: "Riz (Vary)", price: 3200, unit: "Ar/kg", trend: "up" as const, change: "+5%" },
  { crop: "Vanille", price: 250000, unit: "Ar/kg", trend: "down" as const, change: "-3%" },
  { crop: "Café", price: 18000, unit: "Ar/kg", trend: "up" as const, change: "+2%" },
  { crop: "Clou de girofle", price: 35000, unit: "Ar/kg", trend: "stable" as const, change: "0%" },
  { crop: "Litchi", price: 5000, unit: "Ar/kg", trend: "up" as const, change: "+8%" },
  { crop: "Manioc", price: 1200, unit: "Ar/kg", trend: "down" as const, change: "-2%" },
  { crop: "Maïs", price: 2000, unit: "Ar/kg", trend: "stable" as const, change: "0%" },
  { crop: "Pois du cap", price: 8000, unit: "Ar/kg", trend: "up" as const, change: "+4%" },
];

export const sensorData = {
  soilMoisture: 42,
  temperature: 28,
  humidity: 65,
  lightLevel: 75,
  windSpeed: 12,
  rainfall: 0,
};

export const smsNotifications = [
  {
    id: 1,
    phone: "+261 34 00 123 45",
    message: "\u26a0\ufe0f Alerte Cyclone: Protégez vos cultures dans les 72h.",
    status: "delivered" as const,
    time: "Aujourd'hui, 08:30",
  },
  {
    id: 2,
    phone: "+261 32 00 678 90",
    message: "\ud83c\udf31 Attendez 4 jours avant de planter le riz.",
    status: "delivered" as const,
    time: "Aujourd'hui, 07:15",
  },
  {
    id: 3,
    phone: "+261 33 00 111 22",
    message: "\ud83d\udca7 Votre parcelle manque d'eau. Arrosez aujourd'hui.",
    status: "pending" as const,
    time: "Hier, 18:00",
  },
  {
    id: 4,
    phone: "+261 34 00 333 44",
    message: "\ud83d\udcca Prix du riz: 3 200 Ar/kg (+5%). Bon moment pour vendre.",
    status: "delivered" as const,
    time: "Hier, 12:00",
  },
];

export const agronomicTips = [
  {
    season: "Oktobra - Desambra (Ketsa)",
    crop: "Riz (Vary), Maïs",
    advice:
      "Début de la saison des pluies. Préparez les pépinières et semez le riz. Le maïs peut être semé directement.",
    icon: "sprout" as const,
  },
  {
    season: "Desambra - Febroary",
    crop: "Vary, Arachide",
    advice:
      "Période de transplantation (Fanetsana) et de sarclage. Surveillez les attaques de chenilles légionnaires.",
    icon: "sun" as const,
  },
  {
    season: "Mars - Mey",
    crop: "Haricot, Pomme de terre",
    advice:
      "Fin des pluies. Récolte principale (Jinja) du riz et préparation des cultures de contre-saison.",
    icon: "cloud-rain" as const,
  },
  {
    season: "Jona - Aogositra (Asara)",
    crop: "Légumes d'hiver, Blé",
    advice:
      "Saison sèche et fraîche. Idéale pour les cultures maraîchères avec irrigation contrôlée.",
    icon: "shovel" as const,
  },
];