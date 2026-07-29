# Structure de Projet Flutter AgriSense

Le dossier `flutter_project/` contient une structure de base pour porter **AgriSense Madagascar** de React/Next.js vers Flutter.

## 📂 Structure Créée

```
flutter_project/
├── pubspec.yaml                    # Dépendances du projet
├── lib/
│   ├── main.dart                   # Point d'entrée
│   ├── config/
│   │   ├── constants.dart          # Constantes API et app
│   │   └── theme.dart              # Thème Material
│   ├── models/
│   │   ├── sensor_data.dart        # Modèle données capteurs
│   │   ├── alert.dart              # Modèle alertes
│   │   └── crop.dart               # Modèle cultures
│   ├── services/
│   │   ├── api_service.dart        # Appels API
│   │   └── storage_service.dart    # Stockage local
│   ├── providers/                  # State Management (Provider)
│   │   ├── sensor_provider.dart    # Capteurs
│   │   ├── weather_provider.dart   # Météo
│   │   └── auth_provider.dart      # Authentification
│   ├── screens/
│   │   ├── main_screen.dart        # Navigation principale
│   │   └── ... (autres onglets à compléter)
│   └── widgets/
│       ├── home_tab.dart           # Onglet accueil
│       └── ... (autres widgets)
```

## 🚀 Prochaines Étapes

### 1. Initialiser le projet Flutter
```bash
cd flutter_project
flutter pub get
```

### 2. Compléter les autres onglets
- [ ] SahakoTab (cultures)
- [ ] TetiandroTab (calendrier agricole)
- [ ] KajyTab (calculs)
- [ ] TsenaTab (cours du marché)
- [ ] Hafa (IA, voix, SMS)

### 3. Implémenter les fonctionnalités
- [ ] Cartes (Google Maps)
- [ ] IA Diagnosis (image + Gemini)
- [ ] Reconnaissance vocale
- [ ] Synthèse vocale
- [ ] Notifications SMS (Twilio)

### 4. Tester
```bash
flutter test
flutter run
```

## 📋 Fichiers Clés à Adapter

### React → Flutter
| React | Flutter |
|-------|---------|
| `useState` | `StatefulWidget` + `setState` |
| `useEffect` | `initState` + `dispose` |
| `Context` | `Provider` (package) |
| `fetch` API | `http` package |
| `localStorage` | `SharedPreferences` |
| `react-router` | `GoRouter` |
| Tailwind CSS | Material Theme |

## 🔗 Resources

- [Flutter Docs](https://flutter.dev/docs)
- [Provider Package](https://pub.dev/packages/provider)
- [Dart JSON Serialization](https://dart.dev/guides/json)

## 💡 Tips

1. **Toujours utiliser `ChangeNotifier`** pour l'état
2. **Respecter la structure MVC** (Models, Views, Controllers)
3. **Tester sur Android et iOS** (si possible)
4. **Utiliser `const` Widget** pour optimiser les performances
5. **Gérer les erreurs réseau** proprement

---

**Besoin d'aide ?** Les fichiers contiennent des commentaires et exemples d'utilisation.
