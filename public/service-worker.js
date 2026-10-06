/**
 * Service Worker géré par vite-plugin-pwa (Workbox).
 * Ce fichier est conservé uniquement comme fallback.
 * Le vrai SW est généré automatiquement par vite-plugin-pwa lors du build.
 *
 * ⚠️ Ne pas modifier les chemins manuellement — Vite génère des noms hashés.
 */
const CACHE_NAME = 'pharmago-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Supprimer les anciens caches
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  // Laisser passer les requêtes API sans mise en cache
  if (
    event.request.url.includes('overpass-api.de') ||
    event.request.url.includes('supabase.co')
  ) {
    event.respondWith(
      fetch(event.request).catch(
        () => new Response('Erreur réseau', { status: 503 })
      )
    );
    return;
  }

  // Cache-first pour les assets statiques
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});