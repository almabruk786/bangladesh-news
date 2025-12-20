"use client";
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { X } from 'lucide-react';

export default function AdPopup() {
    const [ad, setAd] = useState(null);
    const [show, setShow] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => {
            getDoc(doc(db, "ads", "popup")).then(snap => {
                if (snap.exists() && snap.data().isActive === true) { setAd(snap.data()); setShow(true); }
            });
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    if (!show || !ad) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={() => setShow(false)}>
            <div className="relative bg-white p-2 rounded-2xl shadow-2xl max-w-lg w-full scale-100 transition-transform" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShow(false)} className="absolute -top-4 -right-4 bg-white text-slate-900 rounded-full p-2 shadow-lg hover:bg-slate-100 z-10">
                    <X size={24} />
                </button>
                <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl">
                    <img src={ad.imageUrl} alt="Advertisement" className="w-full h-auto max-h-[80vh] object-contain" />
                </a>
            </div>
        </div>
    );
}
