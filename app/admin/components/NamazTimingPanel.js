"use client";
import { useState, useEffect } from 'react';
import { MapPin, Moon, Sun, Sunrise, Sunset, Clock, Bell, BellOff, Navigation, Loader, Volume2, VolumeX } from 'lucide-react';

const BD_CITIES = [
    { name: 'Dhaka', nameBn: 'ঢাকা', lat: 23.8103, lng: 90.4125 },
    { name: 'Chittagong', nameBn: 'চট্টগ্রাম', lat: 22.3569, lng: 91.7832 },
    { name: 'Sylhet', nameBn: 'সিলেট', lat: 24.8949, lng: 91.8687 },
    { name: 'Rajshahi', nameBn: 'রাজশাহী', lat: 24.3745, lng: 88.6042 },
    { name: 'Khulna', nameBn: 'খুলনা', lat: 22.8456, lng: 89.5403 },
    { name: 'Barisal', nameBn: 'বরিশাল', lat: 22.7010, lng: 90.3535 },
    { name: 'Rangpur', nameBn: 'রংপুর', lat: 25.7439, lng: 89.2752 },
    { name: 'Mymensingh', nameBn: 'ময়মনসিংহ', lat: 24.7471, lng: 90.4203 },
];

export default function NamazTimingPanel() {
    const [activeTab, setActiveTab] = useState('fard'); // fard, nafl, haram
    const [location, setLocation] = useState(BD_CITIES[0]); // Default Dhaka
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [nextEvent, setNextEvent] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [hijriDate, setHijriDate] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [usingGPS, setUsingGPS] = useState(false);

    // Global notification state for Fard prayers
    const [fardNotificationsEnabled, setFardNotificationsEnabled] = useState(true);

    // Helper to request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Get GPS Location
    const handleGPSLocation = () => {
        setUsingGPS(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        name: 'My Location',
                        nameBn: 'আমার অবস্থান',
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setUsingGPS(false);
                },
                (error) => {
                    console.error("GPS Error: ", error);
                    alert("GPS অবস্থান পাওয়া যাচ্ছে না। ডিফল্ট অবস্থান ব্যবহার করা হচ্ছে।");
                    setUsingGPS(false);
                }
            );
        } else {
            alert("আপনার ব্রাউজারে জিওলোকেশন সাপোর্ট নেই।");
            setUsingGPS(false);
        }
    };

    // Bangla Number Converter
    const toBnNum = (str) => {
        if (str === null || str === undefined) return '';
        const enObj = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
        return String(str).replace(/[0-9]/g, match => enObj[match]);
    };

    // Helper: 12-Hour Bangla Time Formatter
    const formatTimeBN = (timeStr, addMinsVal = 0) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(h);
        date.setMinutes(m + addMinsVal);

        let hours = date.getHours();
        const minutes = date.getMinutes();

        // Convert to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        const hStr = toBnNum(String(hours).padStart(2, '0'));
        const mStr = toBnNum(String(minutes).padStart(2, '0'));

        return `${hStr}:${mStr}`;
    };

    // Fetch Prayer Times
    useEffect(() => {
        const fetchTimes = async () => {
            setIsLoading(true);
            try {
                const date = new Date();
                const d = date.getDate();
                const m = date.getMonth() + 1;
                const y = date.getFullYear();

                const res = await fetch(`https://api.aladhan.com/v1/timings/${d}-${m}-${y}?latitude=${location.lat}&longitude=${location.lng}&method=1&school=1`);
                const data = await res.json();

                if (data.code === 200) {
                    setPrayerTimes(data.data);

                    // Format Gregorian Date in Bangla
                    const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
                    const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

                    const dayName = days[date.getDay()];
                    const dayNum = toBnNum(d);
                    const monthName = months[date.getMonth()];
                    const yearNum = toBnNum(y);

                    setCurrentDate(`${dayName}, ${dayNum} ${monthName} ${yearNum}`);

                    // Format Hijri Date
                    if (data.data.date.hijri) {
                        const h = data.data.date.hijri;
                        const hijriMonths = {
                            'Muharram': 'মহররম', 'Safar': 'সফর', 'Rabi al-Awwal': 'রবিউল আউয়াল', 'Rabi al-Thani': 'রবিউল সানি',
                            'Jumada al-Ula': 'জমাদিউল আউয়াল', 'Jumada al-Akhirah': 'জমাদিউল সানি', 'Rajab': 'রজব', 'Sha\'ban': 'শাবান',
                            'Ramadan': 'রমজান', 'Shawwal': 'শাওয়াল', 'Dhu al-Qi\'dah': 'জিলকদ', 'Dhu al-Hijjah': 'জিলহজ্জ'
                        };
                        const hDay = toBnNum(h.day);
                        const hMonth = hijriMonths[h.month.en] || h.month.en;
                        const hYear = toBnNum(h.year);
                        setHijriDate(`${hDay} ${hMonth}, ${hYear} হিজরি`);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTimes();
    }, [location]);

    // Countdown & Notification Logic
    useEffect(() => {
        if (!prayerTimes) return;

        const updateTimer = () => {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const timings = prayerTimes.timings;

            // Helper to parsing time "HH:MM" to minutes
            const toMins = (t) => {
                const [h, m] = t.split(':');
                return parseInt(h) * 60 + parseInt(m);
            };

            const sunriseMin = toMins(timings.Sunrise);
            const sunsetMin = toMins(timings.Sunset);
            const dhuhrMin = toMins(timings.Dhuhr);
            const maghribMin = toMins(timings.Maghrib);
            const ishaMin = toMins(timings.Isha);
            const fajrMin = toMins(timings.Fajr);

            // Define events
            const events = [
                { name: 'Fajr', nameBn: 'ফজর', time: fajrMin, type: 'fard' },
                { name: 'Sunrise', nameBn: 'সূর্যোদয়', time: sunriseMin, type: 'haram' },
                { name: 'Ishraq', nameBn: 'ইশরাক', time: sunriseMin + 15, type: 'nafl' },
                { name: 'Zawal', nameBn: 'জাওয়াল', time: dhuhrMin - 15, type: 'haram' },
                { name: 'Dhuhr', nameBn: 'যোহর', time: dhuhrMin, type: 'fard' },
                { name: 'Asr', nameBn: 'আসর', time: toMins(timings.Asr), type: 'fard' },
                { name: 'Sunset', nameBn: 'সূর্যাস্ত', time: sunsetMin - 15, type: 'haram' },
                { name: 'Maghrib', nameBn: 'মাগরিব', time: maghribMin, type: 'fard' },
                { name: 'Awwabin', nameBn: 'আওয়াবিন', time: maghribMin + 20, type: 'nafl' },
                { name: 'Isha', nameBn: 'এশা', time: ishaMin, type: 'fard' },
                { name: 'Tahajjud', nameBn: 'তাহাজ্জুদ', time: ishaMin + 240, type: 'nafl' }
            ];

            // Sort & Find Next
            events.sort((a, b) => a.time - b.time);

            let next = events.find(e => e.time > currentTime);
            if (!next) {
                next = { ...events[0], time: events[0].time + 1440 };
            }
            setNextEvent(next);

            const diff = next.time - currentTime;
            const h = Math.floor(diff / 60);
            const m = diff % 60;
            const hStr = h > 0 ? `${toBnNum(h)} ঘণ্টা` : '';
            const mStr = `${toBnNum(m)} মিনিট`;
            setTimeLeft(`${hStr} ${mStr} বাকি`);

            // Notifications
            if (diff === 10 && next.type === 'fard' && fardNotificationsEnabled && Notification.permission === 'granted') {
                new Notification('নামাজের সময়', {
                    body: `${next.nameBn} নামাজের ১০ মিনিট বাকি`,
                    icon: '/bn-icon.png'
                });
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
    }, [prayerTimes, fardNotificationsEnabled]);


    // Tab Content Generation
    const getTabContent = () => {
        if (!prayerTimes) return [];
        const t = prayerTimes.timings;

        if (activeTab === 'fard') {
            return [
                { id: 'Fajr', name: 'ফজর', start: formatTimeBN(t.Fajr), end: formatTimeBN(t.Sunrise), icon: <Sunrise size={20} /> },
                { id: 'Dhuhr', name: 'যোহর', start: formatTimeBN(t.Dhuhr), end: formatTimeBN(t.Asr), icon: <Sun size={20} /> },
                { id: 'Asr', name: 'আসর', start: formatTimeBN(t.Asr), end: formatTimeBN(t.Maghrib), icon: <Sun size={20} className="opacity-70" /> },
                { id: 'Maghrib', name: 'মাগরিব', start: formatTimeBN(t.Maghrib), end: formatTimeBN(t.Isha), icon: <Sunset size={20} /> },
                { id: 'Isha', name: 'এশা', start: formatTimeBN(t.Isha), end: formatTimeBN(t.Fajr), icon: <Moon size={20} /> },
            ];
        }

        if (activeTab === 'nafl') {
            return [
                { name: 'ইশরাক', start: formatTimeBN(t.Sunrise, 15), end: formatTimeBN(t.Dhuhr, -45) },
                { name: 'আওয়াবিন', start: formatTimeBN(t.Maghrib, 20), end: formatTimeBN(t.Isha, -15) },
                { name: 'তাহাজ্জুদ', start: formatTimeBN(t.Isha, 180), end: formatTimeBN(t.Fajr, -30) },
            ];
        }

        if (activeTab === 'haram') {
            return [
                { name: 'সূর্যোদয়', start: formatTimeBN(t.Sunrise), end: formatTimeBN(t.Sunrise, 15) },
                { name: 'জাওয়াল (দ্বিপ্রহর)', start: formatTimeBN(t.Dhuhr, -15), end: formatTimeBN(t.Dhuhr, -5) },
                { name: 'সূর্যাস্ত', start: formatTimeBN(t.Maghrib, -15), end: formatTimeBN(t.Maghrib) }, // Haram ends exactly at Maghrib
            ];
        }
    };

    if (isLoading && !prayerTimes) return (
        <div className="flex justify-center items-center h-96">
            <Loader className="animate-spin text-green-600" size={32} />
        </div>
    );

    const listData = getTabContent();

    return (
        <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-900 min-h-[600px] shadow-2xl rounded-[30px] overflow-hidden border border-gray-100 dark:border-gray-800 relative font-sans">

            {/* Header: Location & Notifications */}
            <div className="bg-white dark:bg-gray-900 p-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-2">
                    <MapPin className="text-green-600 dark:text-green-400" size={20} />
                    {usingGPS ? (
                        <span className="font-bold text-gray-800 dark:text-gray-200 animate-pulse">অবস্থান নির্ণয় হচ্ছে...</span>
                    ) : (
                        <select
                            value={location.name}
                            onChange={(e) => setLocation(BD_CITIES.find(c => c.name === e.target.value))}
                            className="font-bold text-gray-800 dark:text-gray-200 bg-transparent outline-none cursor-pointer appearance-none text-lg"
                        >
                            <option value="My Location">📍 আমার অবস্থান (GPS)</option>
                            {BD_CITIES.filter(c => c.name !== 'My Location').map(c => (
                                <option key={c.name} value={c.name}>{c.nameBn}</option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFardNotificationsEnabled(!fardNotificationsEnabled)}
                        className={`p-2 rounded-full transition-colors ${fardNotificationsEnabled ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}
                        title="ফরজ নামাজের নোটিফিকেশন"
                    >
                        {fardNotificationsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    <button onClick={handleGPSLocation} className="p-2 bg-green-50 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 hover:bg-green-100 transition-colors" title="GPS ব্যবহার করুন">
                        <Navigation size={18} />
                    </button>
                </div>
            </div>

            {/* Hero Card */}
            <div className="px-4 pb-6 pt-2">
                <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-[24px] p-6 text-white text-center shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>

                    <div className="relative z-10 flex flex-col gap-1">
                        <p className="text-lg font-bold">{currentDate || 'তারিখ লোড হচ্ছে...'}</p>
                        <p className="text-sm font-medium opacity-80">{hijriDate || 'হিজরি তারিখ...'}</p>
                    </div>

                    <div className="my-6 relative flex items-center justify-center z-10">
                        <div className="w-52 h-52 rounded-full border-[6px] border-white/20 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md relative shadow-inner">
                            <div className="absolute inset-0 rounded-full border-[6px] border-t-white border-r-white/50 border-b-transparent border-l-transparent rotate-45"></div>

                            <p className="text-sm font-medium mb-1 opacity-90">পরবর্তী ওয়াক্ত</p>
                            <h2 className="text-3xl font-bold mb-1">{nextEvent?.nameBn || '-'}</h2>
                            <p className="text-xl font-bold text-green-200">{timeLeft}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center px-2 mt-2 relative z-10">
                        <div className="text-left">
                            <div className="flex items-center gap-1 mb-1 opacity-90">
                                <Sunrise size={16} /> <span className="text-xs font-bold">সেহরি শেষ</span>
                            </div>
                            <p className="text-lg font-bold">{formatTimeBN(prayerTimes.timings.Fajr)}</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1 justify-end mb-1 opacity-90">
                                <Sunset size={16} /> <span className="text-xs font-bold">ইফতার শুরু</span>
                            </div>
                            <p className="text-lg font-bold">{formatTimeBN(prayerTimes.timings.Maghrib)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-full p-1.5 flex shadow-sm border border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('fard')}
                        className={`flex-1 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'fard' ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        ফরজ নামাজ
                    </button>
                    <button
                        onClick={() => setActiveTab('nafl')}
                        className={`flex-1 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'nafl' ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        নফল নামাজ
                    </button>
                    <button
                        onClick={() => setActiveTab('haram')}
                        className={`flex-1 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'haram' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        নিষিদ্ধ সময়
                    </button>
                </div>
            </div>

            {/* List Content */}
            <div className="px-4 pb-8 space-y-3">
                {listData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-4">
                            {item.icon && (
                                <div className="text-green-600 dark:text-green-400 p-2 bg-green-50 dark:bg-green-900/20 rounded-full">
                                    {item.icon}
                                </div>
                            )}
                            <div>
                                <span className="font-bold text-gray-800 dark:text-gray-200 text-xl block">{item.name}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-gray-800 dark:text-gray-200 text-2xl">
                                {item.start} &nbsp;—&nbsp; {item.end}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="h-8"></div>
        </div>
    );
}
