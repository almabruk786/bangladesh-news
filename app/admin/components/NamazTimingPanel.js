"use client";
import { useState, useEffect } from 'react';
import { MapPin, Bell, BellOff, Clock, Calendar, Moon, Sun } from 'lucide-react';

const BD_CITIES = [
    { name: 'Dhaka', lat: 23.8103, lng: 90.4125 },
    { name: 'Chittagong', lat: 22.3569, lng: 91.7832 },
    { name: 'Sylhet', lat: 24.8949, lng: 91.8687 },
    { name: 'Rajshahi', lat: 24.3745, lng: 88.6042 },
    { name: 'Khulna', lat: 22.8456, lng: 89.5403 },
    { name: 'Barisal', lat: 22.7010, lng: 90.3535 },
];

export default function NamazTimingPanel() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedCity, setSelectedCity] = useState(BD_CITIES[1]); // Default: Chittagong
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [nextPrayer, setNextPrayer] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [notificationSettings, setNotificationSettings] = useState({
        Fajr: true,
        Dhuhr: true,
        Asr: true,
        Maghrib: true,
        Isha: true
    });

    // Real-time clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch prayer times when city changes
    useEffect(() => {
        const fetchPrayerTimes = async () => {
            try {
                const date = new Date();
                const day = date.getDate();
                const month = date.getMonth() + 1;
                const year = date.getFullYear();

                const response = await fetch(
                    `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${selectedCity.lat}&longitude=${selectedCity.lng}&method=1`
                );
                const data = await response.json();

                if (data.code === 200) {
                    setPrayerTimes(data.data.timings);
                }
            } catch (error) {
                console.error('Error fetching prayer times:', error);
            }
        };

        fetchPrayerTimes();
    }, [selectedCity]);

    // Calculate next prayer
    useEffect(() => {
        if (!prayerTimes) return;

        const calculateNext = () => {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            const prayers = [
                { name: 'Fajr', namebn: 'ফজর', time: prayerTimes.Fajr, icon: '🌅' },
                { name: 'Dhuhr', namebn: 'যোহর', time: prayerTimes.Dhuhr, icon: '☀️' },
                { name: 'Asr', namebn: 'আসর', time: prayerTimes.Asr, icon: '🌤️' },
                { name: 'Maghrib', namebn: 'মাগরিব', time: prayerTimes.Maghrib, icon: '🌆' },
                { name: 'Isha', namebn: 'এশা', time: prayerTimes.Isha, icon: '🌙' }
            ];

            const prayerMinutes = prayers.map(p => {
                const [h, m] = p.time.split(':');
                return { ...p, minutes: parseInt(h) * 60 + parseInt(m) };
            });

            let next = null;
            for (const prayer of prayerMinutes) {
                if (currentMinutes < prayer.minutes) {
                    next = prayer;
                    break;
                }
            }

            if (!next) next = prayerMinutes[0];

            setNextPrayer(next);

            // Calculate time left
            const nextMinutes = next.minutes > currentMinutes ? next.minutes : next.minutes + 1440;
            const diff = nextMinutes - currentMinutes;
            const hours = Math.floor(diff / 60);
            const mins = diff % 60;
            setTimeLeft(`${hours}ঘ ${mins}মি`);

            // Check if notification needed
            if (diff === 10 && notificationSettings[next.name] && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('নামাজের সময়', {
                    body: `${next.namebn} নামাজ ১০ মিনিট পরে`,
                    icon: '/bn-icon.png'
                });
            }
        };

        calculateNext();
        const interval = setInterval(calculateNext, 1000);
        return () => clearInterval(interval);
    }, [prayerTimes, notificationSettings]);

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const toggleNotification = (prayer) => {
        setNotificationSettings(prev => ({
            ...prev,
            [prayer]: !prev[prayer]
        }));
    };

    const formatDate = (date) => {
        const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
        const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
        return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    if (!prayerTimes) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                        <div className="animate-pulse space-y-6">
                            <div className="h-12 bg-emerald-200 dark:bg-emerald-800 rounded-xl w-3/4 mx-auto"></div>
                            <div className="h-32 bg-emerald-100 dark:bg-emerald-900 rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header: Clock & Date */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Moon size={32} className="animate-pulse" />
                            <h1 className="text-3xl md:text-4xl font-black">নামাজের সময়সূচী</h1>
                        </div>
                        <Sun size={28} className="opacity-60" />
                    </div>

                    {/* Real-Time Clock */}
                    <div className="text-center py-6">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <Clock size={48} />
                            <div className="text-7xl md:text-8xl font-black font-mono tabular-nums">
                                {currentTime.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-emerald-100">
                            <Calendar size={20} />
                            <p className="text-xl font-semibold">{formatDate(currentTime)}</p>
                        </div>
                    </div>

                    {/* Location Selector */}
                    <div className="flex items-center justify-center gap-3 mt-4">
                        <MapPin size={20} />
                        <select
                            value={selectedCity.name}
                            onChange={(e) => setSelectedCity(BD_CITIES.find(c => c.name === e.target.value))}
                            className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border-2 border-white/30 text-white font-bold text-lg focus:outline-none focus:ring-4 focus:ring-white/50 cursor-pointer"
                        >
                            {BD_CITIES.map(city => (
                                <option key={city.name} value={city.name} className="text-gray-900">
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Next Prayer Card */}
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-8 text-white shadow-2xl">
                    <p className="text-sm font-semibold opacity-90 mb-2">পরবর্তী নামাজ</p>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-6xl font-black mb-2">
                                {nextPrayer?.icon} {nextPrayer?.namebn}
                            </p>
                            <p className="text-3xl font-bold opacity-90">
                                {nextPrayer?.time.substring(0, 5)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm opacity-90">বাকি সময়</p>
                            <p className="text-5xl font-black">{timeLeft}</p>
                        </div>
                    </div>
                </div>

                {/* All Prayer Times with Notification Toggle */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                    <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-6">সকল নামাজের সময়</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { name: 'Fajr', namebn: 'ফজর', time: prayerTimes.Fajr, icon: '🌅', color: 'from-blue-500 to-indigo-500' },
                            { name: 'Dhuhr', namebn: 'যোহর', time: prayerTimes.Dhuhr, icon: '☀️', color: 'from-yellow-500 to-orange-500' },
                            { name: 'Asr', namebn: 'আসর', time: prayerTimes.Asr, icon: '🌤️', color: 'from-amber-500 to-yellow-500' },
                            { name: 'Maghrib', namebn: 'মাগরিব', time: prayerTimes.Maghrib, icon: '🌆', color: 'from-purple-500 to-pink-500' },
                            { name: 'Isha', namebn: 'এশা', time: prayerTimes.Isha, icon: '🌙', color: 'from-indigo-600 to-purple-600' }
                        ].map((prayer) => (
                            <div
                                key={prayer.name}
                                className={`bg-gradient-to-br ${prayer.color} rounded-2xl p-6 text-white shadow-lg transform transition-all hover:scale-105 ${nextPrayer?.name === prayer.name ? 'ring-4 ring-white scale-105' : ''
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl">{prayer.icon}</span>
                                        <div>
                                            <p className="text-2xl font-black">{prayer.namebn}</p>
                                            <p className="text-sm opacity-80">{prayer.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleNotification(prayer.name)}
                                        className={`p-3 rounded-xl backdrop-blur-md transition-all ${notificationSettings[prayer.name]
                                                ? 'bg-white/30 hover:bg-white/40'
                                                : 'bg-black/20 hover:bg-black/30'
                                            }`}
                                    >
                                        {notificationSettings[prayer.name] ? <Bell size={24} /> : <BellOff size={24} />}
                                    </button>
                                </div>
                                <p className="text-5xl font-black font-mono">{prayer.time.substring(0, 5)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sunrise Info */}
                <div className="bg-gradient-to-r from-rose-400 to-pink-400 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🌄</span>
                            <div>
                                <p className="text-xl font-bold">সূর্যোদয়</p>
                                <p className="text-sm opacity-90">Sunrise</p>
                            </div>
                        </div>
                        <p className="text-4xl font-black font-mono">{prayerTimes.Sunrise.substring(0, 5)}</p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 pb-4">
                    গণনা পদ্ধতি: University of Islamic Sciences, Karachi
                </p>
            </div>
        </div>
    );
}
