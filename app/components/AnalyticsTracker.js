"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

export default function AnalyticsTracker() {
    const pathname = usePathname();

    useEffect(() => {
        if (pathname.startsWith('/admin')) return;

        // Debounce or single-session check could be added here
        const logVisit = async () => {
            try {
                // 1. Basic Info
                const userAgent = navigator.userAgent;

                // 0. Filter Bots (Crowlers)
                const isBot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit/i.test(userAgent);
                if (isBot) {
                    console.log("Analytics: Bot detected, ignoring.");
                    return;
                }

                const platform = navigator.platform;
                const timestamp = serverTimestamp();

                // 2. Increment Article View Count
                if (pathname.startsWith('/news/')) {
                    const articleId = pathname.split('/').pop();
                    if (articleId) {
                        const articleRef = doc(db, "articles", articleId);
                        // Fire and forget update
                        updateDoc(articleRef, { views: increment(1) }).catch(e => console.log("View count update failed", e));
                    }
                }

                // 3. Geo Info (Robust Multi-Provider Fallback)
                let locationData = {};

                const fetchGeo = async () => {
                    // Provider 1: ipapi.co (Primary)
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout
                        const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
                        clearTimeout(timeoutId);
                        if (res.ok) {
                            const data = await res.json();
                            if (data.city) return {
                                ip: data.ip,
                                city: data.city,
                                country: data.country_name,
                                isp: data.org
                            };
                        }
                    } catch (e) { }

                    // Provider 2: ipwho.is (Backup)
                    try {
                        const res = await fetch('https://ipwho.is/');
                        if (res.ok) {
                            const data = await res.json();
                            if (data.success) return {
                                ip: data.ip,
                                city: data.city,
                                country: data.country,
                                isp: (data.connection && data.connection.isp)
                            };
                        }
                    } catch (e) { }

                    // Provider 3: db-ip (Last Resort)
                    try {
                        const res = await fetch('https://api.db-ip.com/v2/free/self');
                        if (res.ok) {
                            const data = await res.json();
                            return {
                                ip: data.ipAddress,
                                city: data.city,
                                country: data.countryName,
                                isp: 'Unknown'
                            };
                        }
                    } catch (e) { }

                    return {};
                };

                locationData = await fetchGeo();

                // 4. Source & Referrer
                const referrer = document.referrer || '';
                let source = 'Direct';

                // PWA Detection
                const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.location.search.includes('source=pwa');

                if (isPWA) {
                    source = 'PWA';
                } else if (referrer) {
                    const domain = new URL(referrer).hostname;
                    if (domain.includes('facebook') || domain.includes('t.co') || domain.includes('twitter') || domain.includes('instagram') || domain.includes('linkedin')) {
                        source = 'Social';
                    } else if (domain.includes('google') || domain.includes('bing') || domain.includes('yahoo')) {
                        source = 'Search';
                    } else if (!domain.includes(window.location.hostname)) {
                        source = 'Referral';
                    }
                }

                // 5. Log Raw Visit
                await addDoc(collection(db, "analytics"), {
                    path: pathname,
                    userAgent: userAgent,
                    platform: platform,
                    mobile: /iPhone|iPad|iPod|Android/i.test(userAgent),
                    referrer: referrer,
                    source: source,
                    isPWA: isPWA,
                    ...locationData,
                    timestamp: timestamp
                });

            } catch (error) {
                console.error("Analytics Error", error);
            }
        };

        const timeout = setTimeout(logVisit, 2000);
        return () => clearTimeout(timeout);

    }, [pathname]);

    return null;
}
