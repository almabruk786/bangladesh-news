"use client";
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function NewsSlider({ images, title, altText }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out empty strings first
  const validImages = images && Array.isArray(images) ? images.filter(img => img && img.trim() !== '') : [];

  // অটোমেটিক স্লাইডার (৩ সেকেন্ড পর পর)
  useEffect(() => {
    if (validImages && validImages.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % validImages.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [validImages]);

  if (!validImages || validImages.length === 0) {
    console.log('[NewsSlider] No valid images found. Original images:', images, 'Valid images:', validImages);
    return (
      <div className="w-full h-[300px] md:h-[500px] bg-slate-200 rounded-xl mb-8 flex items-center justify-center text-slate-400">
        ছবি লোড হচ্ছে না
      </div>
    );
  }


  // যদি মাত্র ১টি ছবি থাকে, তবে স্লাইডার হবে না
  if (validImages.length === 1) {
    return (
      <div className="relative w-full h-0 pb-[56.25%] rounded-xl overflow-hidden shadow-lg border border-slate-100">
        <Image
          src={validImages[0]}
          alt={altText || title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
          priority
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-0 pb-[56.25%] bg-slate-100 rounded-xl overflow-hidden shadow-lg border border-slate-100 group">
      {/* ছবি */}
      {/* ছবি (Only render active image for performance) */}
      <div className="absolute inset-0 z-10">
        <Image
          src={validImages[currentIndex]}
          alt={currentIndex === 0 && altText ? altText : `${title} - image ${currentIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
          priority={true}
        />
      </div>

      {/* নেভিগেশন বাটন (অপশনাল) */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % validImages.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition"
      >
        <ChevronRight />
      </button>

      {/* ডট ইন্ডিকেটর */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
        {validImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all shadow-sm ${idx === currentIndex ? 'bg-red-600 w-6' : 'bg-white/80 hover:bg-white'
              }`}
          />
        ))}
      </div>

      {/* কাউন্টার */}
      <div className="absolute top-4 right-4 z-20 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
        {currentIndex + 1} / {validImages.length}
      </div>
    </div>
  );
}