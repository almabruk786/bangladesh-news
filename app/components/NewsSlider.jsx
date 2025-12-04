"use client";
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NewsSlider({ images, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // অটোমেটিক স্লাইডার (৩ সেকেন্ড পর পর)
  useEffect(() => {
    if (images && images.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 3000); 
      return () => clearInterval(timer);
    }
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[300px] md:h-[500px] bg-slate-200 rounded-xl mb-8 flex items-center justify-center text-slate-400">
        ছবি লোড হচ্ছে না
      </div>
    );
  }

  // যদি মাত্র ১টি ছবি থাকে, তবে স্লাইডার হবে না
  if (images.length === 1) {
    return (
      <div className="w-full h-auto rounded-xl mb-8 overflow-hidden shadow-lg">
        <img src={images[0]} alt={title} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[300px] md:h-[500px] bg-slate-100 rounded-xl mb-10 overflow-hidden shadow-lg group">
      {/* ছবি */}
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={img}
            alt={`${title} - image ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* নেভিগেশন বাটন (অপশনাল) */}
      <button 
        onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition"
      >
        <ChevronLeft />
      </button>
      <button 
        onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition"
      >
        <ChevronRight />
      </button>

      {/* ডট ইন্ডিকেটর */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all shadow-sm ${
              idx === currentIndex ? 'bg-red-600 w-6' : 'bg-white/80 hover:bg-white'
            }`}
          />
        ))}
      </div>
      
      {/* কাউন্টার */}
      <div className="absolute top-4 right-4 z-20 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}