const CACHE_NAME = 'bakalia-news-v1';

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Fetch Event - Requirement for PWA Installability
self.addEventListener('fetch', (event) => {
  // Pass through
});
