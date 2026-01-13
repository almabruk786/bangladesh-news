"use client";
import { useState, useEffect } from 'react';
import { X, Moon, Star, Calendar } from 'lucide-react';

export default function RamadanPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [ramadanInfo, setRamadanInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Helper to convert English digits to Bangla
    const toBanglaDigit = (num) => num.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

    useEffect(() => {
        const checkRamadan = async () => {
            try {
                // Check localStorage
                const lastBigPopupShown = localStorage.getItem('ramadanPopupLastShown');
                const now = Date.now();
                const twelveHours = 12 * 60 * 60 * 1000;

                // If shown recently, we start in MINIMIZED mode (Fab visible), otherwise MAXIMIZED (Big popup visible)
                const shouldStartMinimized = lastBigPopupShown && (now - parseInt(lastBigPopupShown) < twelveHours);

                // Fetch Hijri date
                const res = await fetch('https://api.aladhan.com/v1/gToH');
                const data = await res.json();

                if (data.code === 200) {
                    const hijri = data.data.hijri;
                    const currentMonth = hijri.month.number;
                    const currentDay = parseInt(hijri.day);

                    // Calculations
                    const isRamadan = currentMonth === 9;
                    let daysBeforeRamadan = 0;

                    if (currentMonth < 9) {
                        daysBeforeRamadan = ((9 - currentMonth) * 29.5) - currentDay;
                    } else if (currentMonth > 9) {
                        daysBeforeRamadan = ((12 - currentMonth + 9) * 29.5) - currentDay;
                    }

                    daysBeforeRamadan = Math.floor(daysBeforeRamadan);

                    // Estimate Start Date
                    const today = new Date();
                    const estimatedStartDate = new Date(today);
                    estimatedStartDate.setDate(today.getDate() + daysBeforeRamadan + 1); // +1 Day Offset

                    // Manual Bangla Date Construction (Robust)
                    const banglaMonths = [
                        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
                        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
                    ];

                    const day = toBanglaDigit(estimatedStartDate.getDate());
                    const month = banglaMonths[estimatedStartDate.getMonth()];
                    const year = toBanglaDigit(estimatedStartDate.getFullYear());

                    const startDateStr = `${day} ${month} ${year}`;

                    setRamadanInfo({
                        isRamadan,
                        daysLeft: isRamadan ? (30 - currentDay) : 0,
                        daysBeforeRamadan: daysBeforeRamadan + 1, // Also update display count
                        startDateStr
                    });

                    if (shouldStartMinimized) {
                        setIsMinimized(true);
                        setIsOpen(true);
                    } else {
                        setTimeout(() => {
                            setIsOpen(true);
                        }, 2000);
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

    // Auto-minimize effect
    useEffect(() => {
        if (isOpen && !isMinimized) {
            const timer = setTimeout(() => {
                setIsMinimized(true);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, isMinimized]);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('ramadanPopupLastShown', Date.now().toString());
    };

    const handleMinimize = (e) => {
        e?.stopPropagation();
        setIsMinimized(true);
    };

    const handleMaximize = () => {
        setIsMinimized(false);
    };

    if (isLoading || !isOpen || !ramadanInfo) return null;

    const { isRamadan, daysLeft, daysBeforeRamadan, startDateStr } = ramadanInfo;

    // FLOATING ACTION BUTTON (Minimized State)
    if (isMinimized) {
        return (
            <div
                onClick={handleMaximize}
                className="fixed bottom-6 right-6 z-[9990] cursor-pointer group animate-in slide-in-from-bottom-10 fade-in duration-700"
            >
                <div className="absolute inset-0 bg-yellow-400/30 rounded-full animate-ping group-hover:bg-yellow-400/50"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-[#1e1b4b] to-[#4c1d95] rounded-full shadow-2xl border-2 border-yellow-400/50 flex items-center justify-center transform transition-transform group-hover:scale-110 group-active:scale-95 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Moon size={28} className="text-yellow-400 fill-yellow-400 animate-[wiggle_3s_ease-in-out_infinite]" />
                    <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-sm">
                        {toBanglaDigit(isRamadan ? daysLeft : daysBeforeRamadan)}
                    </div>
                </div>
                <div className="absolute bottom-full right-0 mb-2 w-max px-3 py-1 bg-white text-slate-900 text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 pointer-events-none">
                    রমজান আপডেট 🌙
                </div>
            </div>
        );
    }

    // EXPANDED POPUP (Desktop Split Layout)
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
            <div className="absolute inset-0" onClick={handleMinimize}></div>

            {/* Stars Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(40)].map((_, i) => (
                    <Star
                        key={i}
                        className="absolute text-yellow-200 opacity-60 animate-pulse"
                        size={Math.random() * 10 + 4}
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${Math.random() * 2 + 2}s`
                        }}
                    />
                ))}
            </div>

            {/* Main Popup Container */}
            <div className="relative max-w-4xl w-full bg-[#1e1b4b] rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col md:flex-row animate-in zoom-in-95 duration-500">

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors text-white/80 hover:text-white"
                    title="Close Forever"
                >
                    <X size={24} />
                </button>

                {/* Left Side: Visual/Illustration */}
                <div className="relative w-full md:w-5/12 bg-gradient-to-b from-indigo-900 to-[#1e1b4b] overflow-hidden flex items-center justify-center p-8 min-h-[250px] md:min-h-full border-b md:border-b-0 md:border-r border-white/5">
                    {/* Mosque Silhouette Effect (CSS) */}
                    <div className="absolute bottom-0 w-full h-1/2 bg-[url('https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/1f54c.png')] bg-contain bg-bottom bg-no-repeat opacity-20 invert grayscale mix-blend-overlay"></div>

                    {/* Big Moon */}
                    <div className="relative z-10">
                        <div className="absolute inset-0 bg-yellow-400/20 blur-[50px] rounded-full animate-pulse"></div>
                        <Moon
                            size={140}
                            className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)] animate-[bounce_6s_infinite]"
                        />
                        <Star size={32} className="text-white fill-white absolute -top-4 -right-6 animate-ping" style={{ animationDuration: '3s' }} />
                        <Star size={20} className="text-indigo-200 absolute bottom-4 -left-8 animate-pulse" />
                    </div>

                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#1e1b4b] to-transparent opacity-60"></div>
                </div>

                {/* Right Side: Content */}
                <div className="relative w-full md:w-7/12 p-8 md:p-10 flex flex-col justify-center text-center md:text-left text-white bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95]">

                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-4xl md:text-5xl font-bold mb-2 font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 pb-2" style={{ fontFamily: 'Georgia, serif' }}>
                            رَمَضَان كَرِيم
                        </h2>
                        <p className="text-indigo-200 text-sm tracking-[0.3em] uppercase opacity-80">Ramadan Kareem</p>
                    </div>

                    {/* Countdown Box */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-8">
                        {isRamadan ? (
                            <div className="text-center">
                                <p className="text-xl text-indigo-200 mb-1">পবিত্র রমজান চলছে</p>
                                <p className="text-4xl font-bold text-white mt-2">আর বাকি <span className="text-yellow-400">{toBanglaDigit(daysLeft)}</span> দিন</p>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="text-center md:text-left">
                                    <p className="text-lg text-indigo-300 mb-1">রমজান শুরু হতে বাকি</p>
                                    <div className="flex items-baseline justify-center md:justify-start gap-2">
                                        <span className="text-5xl font-black text-white drop-shadow-lg">{toBanglaDigit(daysBeforeRamadan)}</span>
                                        <span className="text-xl text-yellow-400 font-bold">দিন</span>
                                    </div>
                                </div>
                                <div className="hidden md:block w-px h-12 bg-white/20"></div>
                                <div className="text-center md:text-right">
                                    <div className="flex items-center gap-2 text-indigo-200 text-sm justify-center md:justify-end mb-1">
                                        <Calendar size={14} />
                                        <span>সম্ভাব্য তারিখ</span>
                                    </div>
                                    <p className="text-xl font-bold text-white">{startDateStr}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Verse */}
                    <div className="relative pl-6 border-l-4 border-yellow-500/50 text-left mb-8 hidden md:block">
                        <p className="text-xl text-emerald-300 font-serif leading-relaxed mb-1" dir="rtl">
                            شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ
                        </p>
                        <p className="text-sm text-slate-300 italic">
                            "রমজান মাসই হলো সেই মাস, যাতে নাযিল করা হয়েছে আল-কোরআন।"
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 mt-auto">
                        <button
                            onClick={handleMinimize}
                            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all transform hover:-translate-y-0.5"
                        >
                            আলহামদুলিল্লাহ
                        </button>
                        <p className="text-xs text-indigo-400">
                            এটি স্বয়ংক্রিয়ভাবে মিনিমাইজ হবে <span className="text-yellow-400 animate-pulse">...</span>
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-yellow-400 to-amber-600 animate-[width_10s_linear_forwards] w-full origin-left z-20"></div>
            </div>
        </div>
    );
}
