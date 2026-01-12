import { useState, useEffect } from "react";
import { Megaphone, Upload, RefreshCw, Save } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function AdManager() {
    const [adData, setAdData] = useState({ imageUrl: "", link: "", isActive: false });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Fetch Ad Data (Manual)
    const fetchAdData = async () => {
        try {
            const snap = await getDoc(doc(db, "ads", "popup"));
            if (snap.exists()) {
                const data = snap.data();
                setAdData({ ...data, isActive: !!data.isActive });
            }
        } catch (error) {
            console.error("Error fetching ad data:", error);
        }
    };

    useEffect(() => {
        fetchAdData();
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
            if (data.secure_url) {
                // Determine new state, keeping existing or default false
                setAdData(prev => ({ ...prev, imageUrl: data.secure_url }));
            }
        } catch (error) { alert("Upload Failed"); }
        setUploading(false);
    };

    const saveAd = async () => {
        setLoading(true);
        try {
            // Log what we are saving
            console.log("Saving Ad State:", adData.isActive);
            await setDoc(doc(db, "ads", "popup"), {
                ...adData,
                isActive: adData.isActive === true, // Enforce boolean
                updatedAt: new Date().toISOString()
            });
            alert("Ad Settings Updated Successfully!");
        } catch (error) {
            console.error("Save Error:", error);
            alert("Failed to save settings: " + error.message);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                <Megaphone className="text-purple-600" /> Ad Configuration
            </h2>

            <div className="space-y-6">
                {/* Status Controls - Explicit Buttons */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-3">Popup Status</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setAdData(prev => ({ ...prev, isActive: true }))}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${adData.isActive
                                ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/20"
                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            ACTIVATE
                        </button>
                        <button
                            onClick={() => setAdData(prev => ({ ...prev, isActive: false }))}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${!adData.isActive
                                ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20"
                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            DISABLE
                        </button>
                    </div>
                    <p className={`text-center mt-3 text-sm font-medium ${adData.isActive ? "text-green-600" : "text-slate-400"}`}>
                        Current Status: {adData.isActive ? "SHOWING ON HOMEPAGE" : "HIDDEN"}
                    </p>
                </div>

                {/* Ad Image */}
                <div>
                    <label className="block font-bold mb-2 text-slate-700">Ad Image</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative group">
                        <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" accept="image/*" />
                        <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-purple-600 transition-colors">
                            {uploading ? <RefreshCw className="animate-spin text-purple-600" /> : <Upload />}
                            <span className="font-medium text-sm">Click to upload banner</span>
                        </div>
                    </div>
                    {adData.imageUrl && (
                        <div className="mt-4 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                            <img src={adData.imageUrl} className="w-full h-48 object-contain" />
                            <button
                                onClick={() => setAdData(p => ({ ...p, imageUrl: "" }))}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Link */}
                <div>
                    <label className="block font-bold mb-2 text-slate-700">Destination URL</label>
                    <input
                        className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="https://example.com/offer"
                        value={adData.link || ""}
                        onChange={e => setAdData(prev => ({ ...prev, link: e.target.value }))}
                    />
                </div>

                <button
                    onClick={saveAd}
                    disabled={loading || uploading}
                    className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex justify-center items-center gap-2 mt-4 active:scale-[0.98]"
                >
                    {loading ? <RefreshCw className="animate-spin" /> : <Save size={20} />}
                    SAVE SETTINGS
                </button>
            </div>
        </div>
    );
}
