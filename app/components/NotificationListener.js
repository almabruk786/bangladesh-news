import { useEffect } from 'react';
import { messaging } from '../lib/firebase';
import { onMessage } from 'firebase/messaging';

/**
 * Notification Listener Component
 * Handles foreground notifications (when user has the site open)
 * Must be mounted in the app to receive notifications
 */
export default function NotificationListener() {
    useEffect(() => {
        const setupForegroundNotifications = async () => {
            try {
                const msg = await messaging();

                if (!msg) {
                    console.log('[NotificationListener] Messaging not supported');
                    return;
                }

                // Listen for foreground messages
                const unsubscribe = onMessage(msg, (payload) => {
                    console.log('[NotificationListener] Foreground message received:', payload);

                    const { title, body, imageUrl, link } = payload.data || {};

                    // Check if browser supports notifications
                    if (!('Notification' in window)) {
                        console.error('This browser does not support notifications');
                        return;
                    }

                    // Check permission
                    if (Notification.permission === 'granted') {
                        // Show notification
                        const notificationTitle = title || 'New Update';
                        const notificationOptions = {
                            body: body || 'You have a new notification',
                            icon: '/bn-icon.png',
                            image: imageUrl,
                            badge: '/bn-icon.png',
                            tag: `news-${Date.now()}`,
                            renotify: true,
                            requireInteraction: false,
                            data: { url: link || '/' }
                        };

                        const notification = new Notification(notificationTitle, notificationOptions);

                        // Handle click
                        notification.onclick = function (event) {
                            event.preventDefault();
                            const urlToOpen = event.target.data?.url || link || '/';
                            window.open(urlToOpen, '_blank');
                            notification.close();
                        };
                    } else {
                        console.warn('[NotificationListener] Notification permission not granted');
                    }
                });

                return () => {
                    unsubscribe();
                };
            } catch (error) {
                console.error('[NotificationListener] Setup error:', error);
            }
        };

        setupForegroundNotifications();
    }, []);

    // This component doesn't render anything
    return null;
}
