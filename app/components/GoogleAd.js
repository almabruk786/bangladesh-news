"use client";
import { useEffect, useRef, useState } from 'react';

export default function GoogleAd({ slotId, format = "auto", responsive = "true", style = {} }) {
    const adRef = useRef(null);
    const [adPushed, setAdPushed] = useState(false);

    useEffect(() => {
        if (!adRef.current || adPushed) return;

        const observer = new ResizeObserver((entries) => {
            // Check if we have valid width
            const entry = entries[0];
            if (entry.contentRect.width > 0) {
                try {
                    // Double check if innerHTML is empty to avoid duplicates
                    if (adRef.current && adRef.current.innerHTML === "") {
                        console.log("AdSense: Push (Width: " + entry.contentRect.width + ")");
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                        setAdPushed(true); // Mark as pushed so we don't push again
                    }
                } catch (e) {
                    console.error("AdSense Push Error:", e);
                }
                // Stop observing once pushed
                observer.disconnect();
            }
        });

        observer.observe(adRef.current);

        return () => observer.disconnect();
    }, [adPushed]);

    return (
        <div
            className="w-full bg-slate-100 dark:bg-slate-900 flex justify-center items-center relative my-4"
            style={{ minHeight: '280px', ...style }} // Ensure container has height
        >
            <ins className="adsbygoogle"
                ref={adRef}
                style={{ display: 'block', width: '100%', minWidth: '200px', ...style }} // Enforce block and min-width
                data-ad-client="ca-pub-2257905734584691"
                data-ad-slot={slotId || "3652013893"}
                data-ad-format={format}
                data-full-width-responsive={responsive}
            />
        </div>
    );
}
