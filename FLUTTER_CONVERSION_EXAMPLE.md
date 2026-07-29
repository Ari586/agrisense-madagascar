# 🔄 Exemple de Conversion React → Flutter

## React Original (TypeScript/JSX)

```typescript
// src/components/agrisense/home-tab.tsx
'use client'

import { DashboardTab } from './dashboard-tab'
import { IrrigationTab } from './irrigation-tab'
import { AiDiagnosis } from './ai-diagnosis'

export function HomeTab() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in-50 duration-500">
      <div className="flex flex-col gap-2 mb-2">
        <h2 className="text-2xl font-black text-primary">Fandraisana</h2>
        <p className="text-muted-foreground text-sm">Topi-maso ny fambolenao</p>
      </div>

      <DashboardTab />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IrrigationTab />
        <AiDiagnosis />
      </div>
    </div>
  )
}
```

---

## Flutter Équivalent (Dart)

```dart
// lib/screens/home_tab.dart
import 'package:flutter/material.dart';
import '../widgets/dashboard_tab.dart';
import '../widgets/irrigation_tab.dart';
import '../widgets/ai_diagnosis.dart';

class HomeTab extends StatelessWidget {
  const HomeTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // En-tête
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              spacing: 8.0, // Équivalent de gap-2
              children: [
                // Titre - "Fandraisana"
                Text(
                  'Fandraisana',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
                // Sous-titre
                Text(
                  'Topi-maso ny fambolenao',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          
          // Contenu principal
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Column(
              spacing: 24.0, // Équivalent de gap-6
              children: [
                // Tableau de bord
                const DashboardTab(),
                
                // Grille responsive (1 colonne mobile, 2 sur desktop)
                LayoutBuilder(
                  builder: (context, constraints) {
                    final isMobile = constraints.maxWidth < 768;
                    return GridView.count(
                      crossAxisCount: isMobile ? 1 : 2,
                      mainAxisSpacing: 24.0, // gap-6
                      crossAxisSpacing: 24.0,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      children: const [
                        IrrigationTab(),
                        AiDiagnosis(),
                      ],
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## Conversion du DashboardTab (plus complexe)

### React
```typescript
export function DashboardTab() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      const [sensorRes, alertsRes] = await Promise.all([
        fetch(apiUrl('/api/sensors')).catch(() => null),
        fetch(apiUrl('/api/alerts')).catch(() => null),
      ])
      if (sensorRes?.ok) setSensorData(await sensorRes.json())
      if (alertsRes?.ok) setAlerts(await alertsRes.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div>Chargement...</div>

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Cartes de métriques */}
    </div>
  )
}
```

### Flutter
```dart
// lib/screens/dashboard_tab.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/sensor_data.dart';
import '../providers/sensor_provider.dart';
import '../services/api_service.dart';

class DashboardTab extends StatefulWidget {
  const DashboardTab({Key? key}) : super(key: key);

  @override
  State<DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<DashboardTab> {
  late final ApiService _apiService;

  @override
  void initState() {
    super.initState();
    _apiService = ApiService();
    _fetchData();
    
    // Rafraîchir toutes les 60 secondes
    _timer = Timer.periodic(const Duration(minutes: 1), (_) => _fetchData());
  }

  Timer? _timer;

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _fetchData() async {
    try {
      final sensorData = await _apiService.fetchSensorData();
      final alerts = await _apiService.fetchAlerts();
      
      if (mounted) {
        context.read<SensorProvider>().updateData(sensorData, alerts);
      }
    } catch (e) {
      debugPrint('Erreur fetch: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<SensorProvider>(
      builder: (context, provider, _) {
        if (provider.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        return GridView.count(
          crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
          mainAxisSpacing: 16,
          crossAxisSpacing: 16,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          children: [
            MetricCard(
              label: 'Maripana',
              value: '${provider.sensorData?.temperature ?? '--'}°C',
              icon: Icons.thermostat,
              color: Colors.amber,
            ),
            MetricCard(
              label: 'Hamandoan\'ny Rivotra',
              value: '${provider.sensorData?.humidity ?? '--'}%',
              icon: Icons.water_drop,
              color: Colors.green,
            ),
            MetricCard(
              label: 'Hamandoan\'ny Tany',
              value: '${provider.sensorData?.soilMoisture ?? '--'}%',
              icon: Icons.grain,
              color: Colors.blue,
            ),
            MetricCard(
              label: 'Fampitandremana',
              value: '${provider.alerts.length}',
              icon: Icons.warning,
              color: Colors.red,
            ),
          ],
        );
      },
    );
  }
}

// Composant réutilisable pour les cartes de métriques
class MetricCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const MetricCard({
    Key? key,
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: color.withOpacity(0.3)),
          borderRadius: BorderRadius.circular(8),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## Architecture Flutter Recommandée

```
lib/
├── main.dart                          # Point d'entrée
├── config/
│   ├── constants.dart                 # URLs API, clés
│   └── theme.dart                     # Thème Tailwind-like
├── models/
│   ├── sensor_data.dart
│   ├── alert.dart
│   └── crop.dart
├── providers/                         # State Management (Provider)
│   ├── sensor_provider.dart
│   ├── weather_provider.dart
│   └── auth_provider.dart
├── services/
│   ├── api_service.dart              # HTTP calls
│   ├── storage_service.dart          # SharedPreferences
│   └── location_service.dart         # GPS
├── screens/
│   ├── home_tab.dart                 # HomeTab
│   ├── dashboard_tab.dart            # DashboardTab
│   ├── sahako_tab.dart               # SahakoTab
│   ├── tetiandro_tab.dart            # TetiandroTab
│   ├── kajy_tab.dart                 # KajyTab
│   ├── tsena_tab.dart                # TsenaTab
│   └── main_screen.dart              # Navigation
└── widgets/
    ├── metric_card.dart
    ├── weather_card.dart
    ├── crop_tile.dart
    └── custom_app_bar.dart
```

---

## Dépendances Flutter requises

```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  provider: ^6.0.0
  
  # HTTP & Serialization
  http: ^1.1.0
  json_serializable: ^6.7.0
  
  # Local Storage
  shared_preferences: ^2.2.0
  sqflite: ^2.3.0
  
  # Maps
  google_maps_flutter: ^2.7.0
  
  # Voice & Gemini
  google_generative_ai: ^0.3.0
  speech_to_text: ^6.5.0
  flutter_tts: ^8.2.0
  
  # Charts
  fl_chart: ^0.65.0
  
  # UI
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
```

---

## Principales Différences

| Aspect | React | Flutter |
|--------|-------|---------|
| **État local** | `useState` | `StatefulWidget` + `setState` |
| **État global** | Context API | Provider / Riverpod |
| **Requêtes HTTP** | Fetch / axios | http package |
| **Navigation** | Next.js Router | GoRouter |
| **Localisation** | next-intl | easy_localization |
| **Animations** | Framer Motion | Animation Controller |
| **Stockage local** | localStorage | SharedPreferences |
| **Maps** | Leaflet | google_maps_flutter |
| **Icônes** | Lucide | Material Icons / Cupertino |

---

## Temps Estimé de Portage

- **Simple** (Accueil, liste) : 2-3 jours/écran
- **Moyen** (Tableaux, cartes) : 5-7 jours/écran
- **Complexe** (IA, WebGL) : 2-3 semaines/fonctionnalité
- **Total AgriSense** : **3-4 mois** (1 développeur)

