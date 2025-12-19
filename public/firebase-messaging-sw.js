/* eslint-disable no-restricted-globals */
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyBC5Tz7T71T2Pzvo1ZcqtU-AZJV2UAnkcI",
    authDomain: "bangladesh-news-2188a.firebaseapp.com",
    projectId: "bangladesh-news-2188a",
    storageBucket: "bangladesh-news-2188a.firebasestorage.app",
    messagingSenderId: "143848674748",
    appId: "1:143848674748:web:a0ee0af6c92aec7734c7b9",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Parse data payload
    const { title, body, imageUrl, link, tag } = payload.data;

    const notificationTitle = title;
    const notificationOptions = {
        body: body,
        icon: '/bn-icon.png',
        image: imageUrl,
        tag: tag,
        renotify: true,
        data: { url: link } // Pass link to click handler
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
    console.log('[firebase-messaging-sw.js] Notification click Received.', event);
    event.notification.close();

    // Default to handling webpush or data url
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function (clientList) {
            // Check if there's already a tab open with this URL
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
