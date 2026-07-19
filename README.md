# 🌱 AgriSense Madagascar

AgriSense Madagascar est une application web moderne (Progressive Web App) dédiée à l'agriculture à Madagascar. Son but est d'accompagner les agriculteurs malgaches au quotidien grâce à la technologie, tout en restant simple d'utilisation, rapide et accessible, même hors-ligne.

## ✨ Fonctionnalités Principales

- **Mpanolo-tsaina (Assistant IA)** : Un assistant intelligent (basé sur Gemini) capable de répondre aux questions des agriculteurs par texte et par la voix, directement en Malagasy. Le chat se présente sous la forme d'un widget flottant accessible sur toutes les pages.
- **Base de Données des Cultures (Sahako)** : Des informations détaillées sur les cultures (Vary, Katsaka, Vanille, etc.), incluant le calendrier agricole, les techniques de plantation, et les maladies courantes.
- **Diagnostic des Maladies IA** : Possibilité d'analyser une maladie des plantes pour obtenir une recommandation de traitement traditionnel ou chimique.
- **Météo et Recommandations par Région (Toetrandro)** : Météo dynamique en direct couplée à une carte de Madagascar qui recommande les cultures idéales selon le type de sol et de climat pour chaque région (Analamanga, Atsinanana, SAVA, etc.).
- **Cours du Marché (Tsena)** : Simulation des prix actuels des denrées agricoles malgaches (Produits de rente et produits de base).
- **Lecteur de Documents (Ebooks)** : Une bibliothèque intégrée pour lire des guides PDF et HTML sur l'agriculture et les types de terrain à Madagascar.
- **Mode Hors-Ligne (PWA)** : L'application est téléchargeable sur smartphone et cache automatiquement ses ressources pour fonctionner même dans les champs sans connexion internet.

## 🛠 Technologies Utilisées

- **Frontend** : [Next.js](https://nextjs.org/) (App Router), React 19, TypeScript
- **Style et UI** : [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/) pour les animations fluides
- **Intelligence Artificielle** : Google Gemini Flash via le SDK `@google/generative-ai`
- **Reconnaissance Vocale** : Web Speech API (SpeechRecognition & SpeechSynthesis)
- **Base de Données** : Prisma, fichiers JSON et TypeScript statiques (pour le mode hors-ligne)
- **Hébergement** : [Vercel](https://vercel.com/)

## 🚀 Installation Locale

Pour lancer le projet sur votre propre machine :

1. **Cloner le projet :**
   ```bash
   git clone https://github.com/Ari586/agrisense-madagascar.git
   cd agrisense-madagascar
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement :**
   Créez un fichier `.env.local` à la racine du projet et ajoutez-y votre clé API Gemini :
   ```env
   GEMINI_API_KEY=votre_cle_api_gemini
   ```

4. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```

5. **Ouvrir dans le navigateur :**
   Rendez-vous sur `http://localhost:3000` (ou `3002` selon votre port).

## 🔒 Sécurité

Pour des raisons de sécurité, veillez à ne jamais exposer vos clés API Google Cloud ou Gemini dans le code public du projet. Utilisez toujours les variables d'environnement (`.env.local` et les paramètres d'environnement de Vercel).

## 👨‍💻 Création

Projet initié par `la7ariel@gmail.com` dans le but de moderniser l'accès à l'information agricole à Madagascar.
