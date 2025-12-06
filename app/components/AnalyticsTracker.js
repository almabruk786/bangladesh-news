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

                // 3. Geo Info (Free Service - careful with limits)
                let locationData = {};
                try {
                    const res = await fetch('https://ipapi.co/json/');
                    if (res.ok) {
                        const data = await res.json();
                        locationData = {
                            ip: data.ip,
                            city: data.city,
                            country: data.country_name,
                            isp: data.org
                        };
                    }
                } catch (e) {
                    // console.warn("Geo fetch failed");
                }

                // 4. Source & Referrer
                const referrer = document.referrer || '';
                let source = 'Direct';
                if (referrer) {
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
