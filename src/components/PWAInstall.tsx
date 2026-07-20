'use client';

import { useEffect } from 'react';

export function PWAInstall() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('✓ Service Worker enregistré', reg);
        })
        .catch((err) => {
          console.log('Service Worker enregistrement échoué:', err);
        });
    }

    // Handle network status
    window.addEventListener('online', () => {
      console.log('✓ Connexion rétablie');
    });

    window.addEventListener('offline', () => {
      console.log('⚠ Mode hors ligne');
    });
  }, []);

  return null;
}
