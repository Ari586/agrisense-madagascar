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
    season: "Novembre - Décembre",
    crop: "Riz (Vary), Maïs",
    advice:
      "Début de la saison des pluies. Préparez les pépinières et semez le riz. Le maïs peut être semé directement.",
    icon: "sprout" as const,
  },
  {
    season: "Janvier - Février",
    crop: "Manioc, Patate douce",
    advice:
      "Période de plantation du manioc et de la patate douce. Surveillez les ravageurs.",
    icon: "sun" as const,
  },
  {
    season: "Mars - Avril",
    crop: "Riz (récolte), Légumineuses",
    advice:
      "Récoltez le riz de contre-saison. Semez les pois du cap et haricots.",
    icon: "wheat" as const,
  },
  {
    season: "Mai - Juin",
    crop: "Café, Vanille",
    advice:
      "Entretien des caféiers et vanilliers. Appliquez les engrais organiques.",
    icon: "flower2" as const,
  },
  {
    season: "Juillet - Août",
    crop: "Tomates, Choux, Carottes",
    advice:
      "Saison fraîche idéale pour les légumes. Utilisez l'irrigation goutte-à-goutte.",
    icon: "cloud-rain" as const,
  },
  {
    season: "Septembre - Octobre",
    crop: "Préparation des sols",
    advice:
      "Préparez les rizières et les champs. Effectuez les analyses de sol.",
    icon: "shovel" as const,
  },
];