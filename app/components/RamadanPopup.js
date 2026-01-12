"use client";
import { useState, useEffect } from 'react';
import { X, Moon, Star } from 'lucide-react';

export default function RamadanPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [ramadanInfo, setRamadanInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkRamadan = async () => {
            try {
                // Check localStorage - show only once per day
                const lastShown = localStorage.getItem('ramadanPopupShown');
                const today = new Date().toDateString();

                if (lastShown === today) {
                    setIsLoading(false);
                    return;
                }

                // Fetch Hijri date
                const res = await fetch('https://api.aladhan.com/v1/gToH');
                const data = await res.json();

                if (data.code === 200) {
                    const hijri = data.data.hijri;
                    const currentMonth = hijri.month.number;
                    const currentDay = parseInt(hijri.day);

                    // Check if we're in Ramadan (month 9) or close to it
                    const isRamadan = currentMonth === 9;
                    const daysBeforeRamadan = currentMonth < 9 ?
                        ((9 - currentMonth) * 29 - currentDay) : 0; // Rough estimate

                    if (isRamadan || (daysBeforeRamadan > 0 && daysBeforeRamadan <= 30)) {
                        const daysLeft = isRamadan ? (30 - currentDay) : 0;
                        setRamadanInfo({
                            isRamadan,
                            daysLeft,
                            daysBeforeRamadan
                        });

                        // Show popup after short delay for smooth animation
                        setTimeout(() => {
                            setIsOpen(true);
                        }, 1500);
                    }
                }
            } catch (error) {
                console.error('Ramadan check failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkRamadan();
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('ramadanPopupShown', new Date().toDateString());
    };

    if (isLoading || !isOpen || !ramadanInfo) return null;

    const { isRamadan, daysLeft, daysBeforeRamadan } = ramadanInfo;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
            {/* Stars Background Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <Star
                        key={i}
                        className="absolute text-yellow-300 opacity-70 animate-pulse"
                        size={Math.random() * 12 + 8}
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${Math.random() * 2 + 1}s`
                        }}
                    />
                ))}
            </div>

            {/* Popup Card */}
            <div className="relative max-w-md w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-700">

                {/* Animated Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 animate-pulse"></div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-md"
                >
                    <X size={20} className="text-white" />
                </button>

                {/* Content */}
                <div className="relative z-10 p-8 text-center text-white">

                    {/* Crescent Moon Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            {/* Outer Glow */}
                            <div className="absolute inset-0 bg-yellow-300/50 blur-3xl rounded-full animate-pulse"></div>

                            {/* Moon SVG */}
                            <svg
                                width="120"
                                height="120"
                                viewBox="0 0 120 120"
                                className="relative drop-shadow-2xl animate-bounce"
                                style={{ animationDuration: '3s' }}
                            >
                                <defs>
                                    <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#FCD34D', stopOpacity: 1 }} />
                                        <stop offset="100%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
                                    </linearGradient>
                                </defs>
                                {/* Crescent Moon Path */}
                                <path
                                    d="M 60 10 A 50 50 0 1 1 60 110 A 35 35 0 1 0 60 10 Z"
                                    fill="url(#moonGradient)"
                                    stroke="#FBBF24"
                                    strokeWidth="2"
                                />
                                {/* Star on top */}
                                <circle cx="85" cy="25" r="3" fill="#FFF" className="animate-pulse" />
                            </svg>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="mb-6">
                        {isRamadan ? (
                            <>
                                <h2 className="text-3xl font-bold mb-3 animate-pulse">
                                    رَمَضَان مُبَارَك
                                </h2>
                                <p className="text-2xl font-bold mb-2">
                                    রমজান এসে গেছে! 🌙
                                </p>
                                <p className="text-xl font-semibold mb-4">
                                    আর মাত্র <span className="text-yellow-300 text-3xl">{daysLeft}</span> দিন বাকি!
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold mb-3">
                                    رَمَضَان আসছে! 🌙
                                </h2>
                                <p className="text-xl font-semibold mb-4">
                                    আর মাত্র <span className="text-yellow-300 text-3xl">{daysBeforeRamadan}</span> দিন বাকি!
                                </p>
                            </>
                        )}

                        <p className="text-lg leading-relaxed opacity-95">
                            সেহরি-ইফতার সময়সূচি, দোয়া ও গুরুত্বপূর্ণ আপডেট পেতে <span className="font-bold">আমাদের সাথেই থাকুন।</span>
                        </p>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleClose}
                        className="px-8 py-3 bg-white text-purple-600 font-bold text-lg rounded-full hover:bg-yellow-100 transition-all transform hover:scale-105 shadow-lg"
                    >
                        জাযাকাল্লাহ খাইরান
                    </button>
                </div>

                {/* Bottom Decoration */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"></div>
            </div>
        </div>
    );
}
