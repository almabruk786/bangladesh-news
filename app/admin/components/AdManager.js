import { useState, useEffect } from "react";
import { Megaphone, Upload, RefreshCw, Save } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function AdManager() {
    const [adData, setAdData] = useState({ imageUrl: "", link: "", isActive: false });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        getDoc(doc(db, "ads", "popup")).then(snap => {
            if (snap.exists()) setAdData(snap.data());
        });
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
            const data = await res.json();
            if (data.secure_url) setAdData({ ...adData, imageUrl: data.secure_url });
        } catch (error) { alert("Upload Failed"); }
        setUploading(false);
    };

    const saveAd = async () => {
        setLoading(true);
        await setDoc(doc(db, "ads", "popup"), adData);
        setLoading(false);
        alert("Ad Settings Updated!");
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                <Megaphone className="text-purple-600" /> Ad Configuration
            </h2>

            <div className="space-y-6">
                {/* Toggle */}
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                        <span className="font-bold text-slate-800 block">Popup Status</span>
                        <span className="text-xs text-slate-500">Enable or disable the popup ad on homepage</span>
                    </div>
                    <button
                        onClick={() => setAdData({ ...adData, isActive: !adData.isActive })}
                        className={`px-4 py-2 rounded-lg font-bold transition-colors ${adData.isActive ? "bg-green-500 text-white shadow-lg shadow-green-500/30" : "bg-slate-300 text-slate-600"}`}
                    >
                        {adData.isActive ? "ACTIVE" : "INACTIVE"}
                    </button>
                </div>

                {/* Ad Image */}
                <div>
                    <label className="block font-bold mb-2 text-slate-700">Ad Image</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                        <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                            {uploading ? <RefreshCw className="animate-spin" /> : <Upload />}
                            <span className="font-medium text-sm">Click to upload banner</span>
                        </div>
                    </div>
                    {adData.imageUrl && (
                        <div className="mt-4 relative rounded-xl overflow-hidden border border-slate-200">
                            <img src={adData.imageUrl} className="w-full h-48 object-contain bg-slate-100" />
                        </div>
                    )}
                </div>

                {/* Link */}
                <div>
                    <label className="block font-bold mb-2 text-slate-700">Destination URL</label>
                    <input
                        className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="https://example.com/offer"
                        value={adData.link}
                        onChange={e => setAdData({ ...adData, link: e.target.value })}
                    />
                </div>

                <button
                    onClick={saveAd}
                    disabled={loading || uploading}
                    className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex justify-center items-center gap-2"
                >
                    {loading ? <RefreshCw className="animate-spin" /> : <Save size={20} />}
                    Save Changes
                </button>
            </div>
        </div>
    );
}
