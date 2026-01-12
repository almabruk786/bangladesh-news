"use client";
import { useState, useEffect } from 'react';
import { MapPin, Bell, Clock, AlertTriangle, Sun, Moon } from 'lucide-react';

export default function NamazTimingPanel() {
    const [location, setLocation] = useState(null);
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [currentPrayer, setCurrentPrayer] = useState(null);
    const [nextPrayer, setNextPrayer] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [isForbiddenTime, setIsForbiddenTime] = useState(false);
    const [notifications, setNotifications] = useState(true);

    // Get user's location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                () => {
                    // Default to Chittagong, Bangladesh if denied
                    setLocation({ lat: 22.3569, lng: 91.7832 });
                }
            );
        } else {
            setLocation({ lat: 22.3569, lng: 91.7832 });
        }
    }, []);

    // Fetch prayer times from API
    useEffect(() => {
        if (!location) return;

        const fetchPrayerTimes = async () => {
            try {
                const date = new Date();
                const day = date.getDate();
                const month = date.getMonth() + 1;
                const year = date.getFullYear();

                const response = await fetch(
                    `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${location.lat}&longitude=${location.lng}&method=1`
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
        const interval = setInterval(fetchPrayerTimes, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [location]);

    // Calculate current and next prayer
    useEffect(() => {
        if (!prayerTimes) return;

        const calculatePrayers = () => {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();

            const prayers = [
                { name: 'ফজর', time: prayerTimes.Fajr, icon: '🌅' },
                { name: 'যোহর', time: prayerTimes.Dhuhr, icon: '☀️' },
                { name: 'আসর', time: prayerTimes.Asr, icon: '🌤️' },
                { name: 'মাগরিব', time: prayerTimes.Maghrib, icon: '🌆' },
                { name: 'এশা', time: prayerTimes.Isha, icon: '🌙' }
            ];

            const prayerMinutes = prayers.map(p => {
                const [h, m] = p.time.split(':');
                return { ...p, minutes: parseInt(h) * 60 + parseInt(m) };
            });

            let current = null;
            let next = null;

            for (let i = 0; i < prayerMinutes.length; i++) {
                if (currentTime >= prayerMinutes[i].minutes) {
                    current = prayerMinutes[i];
                    next = prayerMinutes[i + 1] || prayerMinutes[0];
                } else {
                    next = prayerMinutes[i];
                    break;
                }
            }

            if (!next) next = prayerMinutes[0];

            setCurrentPrayer(current);
            setNextPrayer(next);

            // Calculate time left
            const nextMinutes = next.minutes > currentTime ? next.minutes : next.minutes + 1440;
            const diff = nextMinutes - currentTime;
            const hours = Math.floor(diff / 60);
            const mins = diff % 60;
            setTimeLeft(`${hours}ঘ ${mins}মি`);

            // Check forbidden times
            checkForbiddenTime(currentTime, prayerTimes);
        };

        calculatePrayers();
        const interval = setInterval(calculatePrayers, 1000);
        return () => clearInterval(interval);
    }, [prayerTimes]);

    // Check for forbidden prayer times
    const checkForbiddenTime = (currentTime, times) => {
        const sunrise = times.Sunrise.split(':');
        const sunriseMin = parseInt(sunrise[0]) * 60 + parseInt(sunrise[1]);

        const sunset = times.Sunset.split(':');
        const sunsetMin = parseInt(sunset[0]) * 60 + parseInt(sunset[1]);

        const noon = times.Dhuhr.split(':');
        const noonMin = parseInt(noon[0]) * 60 + parseInt(noon[1]);

        // Forbidden times: After sunrise (15 min), Before/After noon (10 min), Before sunset (15 min)
        const forbidden = (
            (currentTime >= sunriseMin && currentTime <= sunriseMin + 15) ||
            (currentTime >= noonMin - 10 && currentTime <= noonMin + 10) ||
            (currentTime >= sunsetMin - 15 && currentTime <= sunsetMin)
        );

        setIsForbiddenTime(forbidden);
    };

    // Request notification permission
    useEffect(() => {
        if (notifications && 'Notification' in window) {
            Notification.requestPermission();
        }
    }, [notifications]);

    // Send notification before prayer
    useEffect(() => {
        if (!nextPrayer || !notifications) return;

        const checkNotification = () => {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const timeDiff = nextPrayer.minutes - currentTime;

            if (timeDiff === 10 && Notification.permission === 'granted') {
                new Notification('নামাজের সময়', {
                    body: `${nextPrayer.name} নামাজ ১০ মিনিট পরে`,
                    icon: '/bn-icon.png'
                });
            }
        };

        const interval = setInterval(checkNotification, 60000);
        return () => clearInterval(interval);
    }, [nextPrayer, notifications]);

    if (!prayerTimes) {
        return (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-green-200 dark:bg-green-800 rounded w-3/4"></div>
                    <div className="h-4 bg-green-200 dark:bg-green-800 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl p-6 border border-green-200 dark:border-green-800 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-green-900 dark:text-green-100 flex items-center gap-2">
                    <Moon className="text-green-600" size={24} />
                    নামাজের সময়সূচী
                </h3>
                <button
                    onClick={() => setNotifications(!notifications)}
                    className={`p-2 rounded-lg transition-colors ${notifications
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                >
                    <Bell size={18} />
                </button>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300 mb-4">
                <MapPin size={16} />
                <span>
                    {location ? `${location.lat.toFixed(2)}°N, ${location.lng.toFixed(2)}°E` : 'Loading...'}
                </span>
            </div>

            {/* Forbidden Time Warning */}
            {isForbiddenTime && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
                    <span className="text-sm font-semibold text-red-800 dark:text-red-200">
                        নিষিদ্ধ সময় - এখন নামাজ পড়া উচিত নয়
                    </span>
                </div>
            )}

            {/* Current & Next Prayer */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">বর্তমান</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {currentPrayer ? `${currentPrayer.icon} ${currentPrayer.name}` : '-'}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg p-4 text-white">
                    <p className="text-xs opacity-90 mb-1">পরবর্তী</p>
                    <p className="text-2xl font-bold">
                        {nextPrayer ? `${nextPrayer.icon} ${nextPrayer.name}` : '-'}
                    </p>
                    <p className="text-xs opacity-90 mt-1 flex items-center gap-1">
                        <Clock size={12} />
                        {timeLeft} পরে
                    </p>
                </div>
            </div>

            {/* All Prayer Times */}
            <div className="space-y-2">
                {[
                    { name: 'ফজর', time: prayerTimes.Fajr, icon: '🌅' },
                    { name: 'সূর্যোদয়', time: prayerTimes.Sunrise, icon: '🌄', forbidden: true },
                    { name: 'যোহর', time: prayerTimes.Dhuhr, icon: '☀️' },
                    { name: 'আসর', time: prayerTimes.Asr, icon: '🌤️' },
                    { name: 'মাগরিব', time: prayerTimes.Maghrib, icon: '🌆' },
                    { name: 'এশা', time: prayerTimes.Isha, icon: '🌙' }
                ].map((prayer) => (
                    <div
                        key={prayer.name}
                        className={`flex items-center justify-between p-3 rounded-lg ${prayer.forbidden
                                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                : nextPrayer?.name === prayer.name
                                    ? 'bg-green-200 dark:bg-green-800 font-bold'
                                    : 'bg-white dark:bg-gray-800'
                            }`}
                    >
                        <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <span>{prayer.icon}</span>
                            <span>{prayer.name}</span>
                            {prayer.forbidden && (
                                <AlertTriangle size={14} className="text-red-600" />
                            )}
                        </span>
                        <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                            {prayer.time.substring(0, 5)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                গণনা পদ্ধতি: University of Islamic Sciences, Karachi
            </p>
        </div>
    );
}
