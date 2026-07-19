# 🌱 AgriSense Madagascar

AgriSense Madagascar est une application web moderne (Progressive Web App) dédiée à l'agriculture à Madagascar. Son objectif est d'accompagner les agriculteurs malgaches au quotidien grâce à la technologie, tout en restant simple d'utilisation, rapide et accessible, même hors-ligne.

## ✨ Fonctionnalités Principales

- **Mpanolo-tsaina (Assistant IA)** : assistant intelligent en Malagasy, disponible en texte et en voix.
- **Base de Données des Cultures (Sahako)** : informations détaillées sur les cultures locales, calendrier agricole, techniques de plantation et maladies.
- **Diagnostic des Maladies IA** : analyse des maladies végétales et recommandations adaptées.
- **Météo et Recommandations par Région (Toetrandro)** : carte de Madagascar avec conseils de culture par climat et sol.
- **Cours du Marché (Tsena)** : simulation des prix des produits agricoles malgaches.
- **Lecteur de Documents (Ebooks)** : guides disponibles en PDF/HTML pour les agriculteurs.
- **Mode Hors-Ligne (PWA)** : l'application peut être installée et utilisée en partie sans connexion.

## 🧭 Architecture du Projet

- `src/app/` : routes Next.js, pages et API.
- `src/components/agrisense/` : interface métier, onglets, widgets, cartes et assistants.
- `src/components/ui/` : composants réutilisables et design system.
- `public/` : ressources statiques, manifest et service worker.
- `prisma/` : schéma de base de données et configuration Prisma.

## 🛠 Technologies Utilisées

- **Frontend** : Next.js (App Router), React 19, TypeScript
- **Style et UI** : Tailwind CSS, shadcn/ui, Framer Motion
- **IA** : Google Gemini via `@google/generative-ai`
- **Voix** : Web Speech API pour reconnaissance vocale et synthèse
- **Données** : Prisma + stockage local pour la PWA
- **CI** : GitHub Actions pour lint et build

## 🚀 Installation Locale

1. **Cloner le projet**
   ```bash
   git clone https://github.com/Ari586/agrisense-madagascar.git
   cd agrisense-madagascar
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Copier la configuration d'environnement**
   ```bash
   cp .env.example .env.local
   ```

4. **Configurer la clé Gemini**
   Ouvrez `.env.local` et remplacez la valeur par votre clé Gemini :
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

6. **Ouvrir dans le navigateur**
   `http://localhost:3000`

## 📦 Scripts utiles

- `npm run dev` : démarre le serveur de développement
- `npm run build` : construit l'application pour la production
- `npm run start` : lance l'application en production
- `npm run lint` : exécute ESLint sur le code

## 🔧 Points d'amélioration déjà appliqués

- synchronisation des champs agricoles (`Sahako`) avec `localStorage`
- badge de notification mis à jour via événement personnalisé
- typage amélioré pour les alertes météo et les assistants vocaux
- correction de l’étiquette de pluie dans le tableau de bord
- ajout d’une configuration GitHub Actions pour CI
- ajout d’un fichier `.env.example`

## 📌 Contribution

Les contributions sont les bienvenues :
- ouvrez une issue pour discuter d'une nouvelle fonctionnalité
- faites une branche dédiée pour vos changements
- envoyez une pull request décrivant vos améliorations

## 🔒 Sécurité

Ne partagez jamais votre clé `GEMINI_API_KEY` publiquement. Gardez-la uniquement dans `.env.local` ou la configuration des secrets de votre hébergeur.

## 👨‍💻 Création

Projet initié par `la7ariel@gmail.com` pour moderniser l'accès à l'information agricole à Madagascar.
