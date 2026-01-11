"use client";
import { useEffect, useRef, useState } from 'react';

export default function GoogleAd({ slotId, format = "auto", responsive = "true", style = {} }) {
    const adRef = useRef(null);
    const [adPushed, setAdPushed] = useState(false);

    useEffect(() => {
        if (!adRef.current || adPushed) return;

        try {
            if (typeof ResizeObserver === 'undefined') {
                // Fallback for older browsers (iOS 12): Just push the ad without checking width
                console.log("AdSense: Legacy Push (No ResizeObserver)");
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                setAdPushed(true);
                return;
            }

            const observer = new ResizeObserver((entries) => {
                const entry = entries[0];
                if (entry.contentRect.width > 0) {
                    try {
                        if (adRef.current && adRef.current.innerHTML === "") {
                            console.log("AdSense: Push (Width: " + entry.contentRect.width + ")");
                            (window.adsbygoogle = window.adsbygoogle || []).push({});
                            setAdPushed(true);
                        }
                    } catch (e) {
                        // Ignore push errors
                    }
                    observer.disconnect();
                }
            });

            observer.observe(adRef.current);
            return () => observer.disconnect();

        } catch (e) {
            console.warn("AdSense Safety Catch", e);
            // Fallback attempt
            if (!adPushed) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                setAdPushed(true);
            }
        }
    }, [adPushed]);

    return (
        <div
            className="w-full flex justify-center items-center relative overflow-hidden"
            style={{ ...style }}
        >
            <ins className="adsbygoogle"
                ref={adRef}
                style={{ display: 'block', width: '100%', ...style }}
                data-ad-client="ca-pub-2257905734584691"
                data-ad-slot={slotId || "3652013893"}
                data-ad-format={format}
                data-full-width-responsive={responsive}
            />
        </div>
    );
}
