import React, { useState, useEffect, useRef } from 'react';
import { Upload, Link as LinkIcon, Download, Image as ImageIcon, X, ArrowRight, Settings, AlertCircle, RefreshCw, FileImage, FileSignature, Wand2, Sliders, Layout, Check, CloudUpload } from 'lucide-react';
// Firebase removed for Cloudinary
import { db } from "../../lib/firebase"; // Ensure path is correct

const ImageConverter = ({ onClose, onProcessed }) => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [compressedUrl, setCompressedUrl] = useState(null);
    const [originalSize, setOriginalSize] = useState(0);
    const [compressedSize, setCompressedSize] = useState(0);

    // Settings
    const [quality, setQuality] = useState(0.8);
    const [filename, setFilename] = useState('news-image');

    // Resize Modes
    const [resizeMode, setResizeMode] = useState('google-landscape'); // Default to 16:9 for News

    // Enhancement Settings
    const [sharpness, setSharpness] = useState(0); // 0-10
    const [brightness, setBrightness] = useState(100); // 100% is default
    const [contrast, setContrast] = useState(100); // 100% is default

    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [inputType, setInputType] = useState('upload'); // 'upload' or 'url'
    const [urlInput, setUrlInput] = useState('');

    const canvasRef = useRef(null);

    // formatting file size
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const applySharpening = (ctx, width, height, amount) => {
        if (amount <= 0) return;

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const copyData = new Uint8ClampedArray(data);

        // Simple sharpen kernel
        const strength = amount * 0.1;

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = (y * width + x) * 4;

                // Convolve for RGB
                for (let c = 0; c < 3; c++) {
                    const val = 5 * copyData[i + c]
                        - copyData[i + c - 4]
                        - copyData[i + c + 4]
                        - copyData[i + c - (width * 4)]
                        - copyData[i + c + (width * 4)];

                    data[i + c] = Math.min(255, Math.max(0, copyData[i + c] + (val - copyData[i + c]) * strength));
                }
            }
        }
        ctx.putImageData(imageData, 0, 0);
    };

    const processImage = (imgElement) => {
        setIsProcessing(true);
        setError('');

        setTimeout(() => {
            try {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');

                let outputWidth = imgElement.naturalWidth;
                let outputHeight = imgElement.naturalHeight;
                let sx = 0, sy = 0, sWidth = imgElement.naturalWidth, sHeight = imgElement.naturalHeight;

                // --- RESIZE LOGIC (Google Discover) ---
                if (resizeMode === 'google-landscape') {
                    outputWidth = 1200;
                    outputHeight = 675; // 16:9 Aspect Ratio

                    // Calculate "Cover" crop
                    const targetRatio = 16 / 9;
                    const srcRatio = sWidth / sHeight;

                    if (srcRatio > targetRatio) {
                        const newSWidth = sHeight * targetRatio;
                        sx = (sWidth - newSWidth) / 2;
                        sWidth = newSWidth;
                    } else {
                        const newSHeight = sWidth / targetRatio;
                        sy = (sHeight - newSHeight) / 2;
                        sHeight = newSHeight;
                    }
                } else if (resizeMode === 'google-square') {
                    outputWidth = 1200;
                    outputHeight = 1200; // 1:1 Aspect Ratio

                    const targetRatio = 1;
                    const srcRatio = sWidth / sHeight;

                    if (srcRatio > targetRatio) {
                        const newSWidth = sHeight * targetRatio;
                        sx = (sWidth - newSWidth) / 2;
                        sWidth = newSWidth;
                    } else {
                        const newSHeight = sWidth / targetRatio;
                        sy = (sHeight - newSHeight) / 2;
                        sHeight = newSHeight;
                    }
                }

                canvas.width = outputWidth;
                canvas.height = outputHeight;

                ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
                ctx.drawImage(imgElement, sx, sy, sWidth, sHeight, 0, 0, outputWidth, outputHeight);
                ctx.filter = 'none';

                if (sharpness > 0) {
                    applySharpening(ctx, outputWidth, outputHeight, sharpness);
                }

                const webpDataUrl = canvas.toDataURL('image/webp', quality);
                setCompressedUrl(webpDataUrl);

                const head = 'data:image/webp;base64,';
                const size = Math.round((webpDataUrl.length - head.length) * 3 / 4);
                setCompressedSize(size);

                setIsProcessing(false);
            } catch (err) {
                console.error(err);
                setError('Error processing image. Browser memory limit may be exceeded.');
                setIsProcessing(false);
            }
        }, 100);
    };

    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.type.match('image.*')) {
            setError('Please select a valid image file');
            return;
        }

        resetState();
        setFile(selectedFile);
        setOriginalSize(selectedFile.size);

        // Auto-clean filename
        let cleanName = selectedFile.name.split('.')[0]
            .replace(/[^a-z0-9]/gi, '-') // Replace non-alphanumeric with hyphen
            .replace(/-+/g, '-')         // remove duplicate hyphens
            .toLowerCase();

        setFilename(cleanName);

        const reader = new FileReader();
        reader.onload = (event) => {
            setPreviewUrl(event.target.result);
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                processImage(img);
                autoEnhance(); // Auto-enhance on load for convenience
            };
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleUrlSubmit = (e) => {
        e.preventDefault();
        if (!urlInput) return;

        resetState();
        setIsProcessing(true);
        setError('');
        setFilename('web-image-' + Date.now());

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = urlInput;

        img.onload = () => {
            setPreviewUrl(urlInput);
            setOriginalSize(0);
            processImage(img);
            autoEnhance();
        };

        img.onerror = () => {
            setIsProcessing(false);
            setError('Unable to load image. The website hosting this image may restrict access (CORS). Please save the image to your computer and upload it instead.');
        };
    };

    // Re-process debounce
    useEffect(() => {
        if (previewUrl && !isProcessing) {
            const timer = setTimeout(() => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = previewUrl;
                img.onload = () => processImage(img);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [quality, sharpness, brightness, contrast, resizeMode]);

    const resetState = () => {
        setFile(null);
        setPreviewUrl(null);
        setCompressedUrl(null);
        setOriginalSize(0);
        setCompressedSize(0);
        setError('');
        // Reset defaults
        setSharpness(0);
        setBrightness(100);
        setContrast(100);
        setQuality(0.8);
        setResizeMode('google-landscape');
    };

    const autoEnhance = () => {
        setSharpness(2);     // Subtle sharpen
        setBrightness(105);  // Vibrant pop
        setContrast(108);    // Deeper blacks
        setQuality(0.85);    // Good balance
    };

    const handleUploadAndUse = async () => {
        if (!compressedUrl) return;
        setIsUploading(true);

        try {
            // Upload to Cloudinary
            const formData = new FormData();
            formData.append("file", compressedUrl); // Cloudinary accepts Data URLs
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
            formData.append("public_id", `${filename || 'news-image'}-${Date.now()}`); // Custom filename

            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

            const res = await fetch(endpoint, { method: "POST", body: formData });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error?.message || "Upload failed");
            }

            const data = await res.json();
            onProcessed(data.secure_url); // Pass back the HTTPS URL
            onClose(); // Close modal
        } catch (err) {
            console.error("Upload failed", err);
            setError("Upload failed: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white"><Wand2 size={20} /></div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Magic Image Studio</h2>
                            <p className="text-xs text-slate-500">Auto-resize to 1200x675 • Convert to WebP</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={24} /></button>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50 flex-1">

                    {/* LEFT: Controls */}
                    <div className="lg:col-span-4 space-y-4">

                        {/* ERROR ALERT */}
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3 border border-red-100 animate-in slide-in-from-top-2">
                                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                                <div>{error}</div>
                            </div>
                        )}

                        {/* 1. UPLOAD */}
                        {!previewUrl && (
                            <div className="bg-white p-6 rounded-2xl border border-dashed border-indigo-200 text-center hover:bg-indigo-50 transition-colors cursor-pointer relative">
                                <input type="file" onChange={handleFileUpload} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                                    <CloudUpload size={24} />
                                </div>
                                <h3 className="font-semibold text-indigo-900">Upload Image</h3>
                                <p className="text-xs text-indigo-500 mt-1">or paste URL below</p>
                                <form onSubmit={handleUrlSubmit} className="mt-4 relative z-20 flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            value={urlInput}
                                            onChange={e => setUrlInput(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full text-xs p-2 pr-8 border rounded outline-none focus:border-indigo-500"
                                            onClick={e => e.stopPropagation()}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!urlInput}
                                        className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Load Image"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <ArrowRight size={14} />
                                    </button>
                                </form>
                            </div>
                        )}

                        {previewUrl && (
                            <>
                                {/* STATS CARD */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between text-sm mb-2 border-b border-slate-100 pb-2">
                                        <span className="text-slate-500">Original Size</span>
                                        <span className="font-mono text-slate-700">{formatSize(originalSize)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Magic Size (WebP)</span>
                                        <span className={`font-mono font-bold ${compressedSize < originalSize ? 'text-green-600' : 'text-slate-800'}`}>
                                            {formatSize(compressedSize)}
                                        </span>
                                    </div>
                                    {compressedSize < originalSize && (
                                        <div className="mt-2 text-xs text-center text-green-600 bg-green-50 py-1 rounded">
                                            Saved {((1 - compressedSize / originalSize) * 100).toFixed(0)}% space! 🚀
                                        </div>
                                    )}
                                </div>

                                {/* ENHANCEMENTS */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Sliders size={14} /> Adjustments</h3>

                                    <div>
                                        <div className="flex justify-between text-xs mb-1"><span>Brightness</span><span>{brightness}%</span></div>
                                        <input type="range" min="50" max="150" value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1"><span>Contrast</span><span>{contrast}%</span></div>
                                        <input type="range" min="50" max="150" value={contrast} onChange={e => setContrast(Number(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1"><span>Sharpen</span><span>{sharpness}</span></div>
                                        <input type="range" min="0" max="10" value={sharpness} onChange={e => setSharpness(Number(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                    </div>
                                </div>

                                {/* FILENAME */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Rename File (SEO)</label>
                                    <div className="flex">
                                        <input value={filename} onChange={e => setFilename(e.target.value)} className="flex-1 min-w-0 px-3 py-2 text-sm border border-slate-300 rounded-l-lg outline-none focus:border-indigo-500" />
                                        <span className="bg-slate-100 border border-l-0 border-slate-300 px-3 py-2 text-xs text-slate-500 rounded-r-lg flex items-center">.webp</span>
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="pt-2 flex gap-3">
                                    <button
                                        onClick={resetState}
                                        disabled={isUploading}
                                        className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-200 hover:bg-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={handleUploadAndUse}
                                        disabled={isUploading}
                                        className={`flex-[2] py-3 text-sm font-bold text-white rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all
                                            ${isUploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'}
                                        `}
                                    >
                                        {isUploading ? <RefreshCw className="animate-spin" size={18} /> : <Check size={18} />}
                                        {isUploading ? 'Uploading (Please Wait)...' : 'Use Image'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* RIGHT: Preview */}
                    <div className="lg:col-span-8 bg-[url('https://www.transparenttextures.com/patterns/subtle-grey.png')] bg-slate-200 rounded-xl border border-slate-300 flex items-center justify-center overflow-hidden relative min-h-[400px]">
                        {compressedUrl ? (
                            <img src={compressedUrl} className="max-w-full max-h-full object-contain shadow-2xl" alt="Preview" />
                        ) : (
                            <div className="text-slate-400 flex flex-col items-center">
                                <ImageIcon size={48} className="mb-2 opacity-50" />
                                <span className="text-sm">Preview will appear here</span>
                            </div>
                        )}

                        {/* Resize Mode Toggles Overlay */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-1 rounded-lg shadow-sm border border-slate-200 flex text-xs font-medium">
                            <button
                                onClick={() => setResizeMode('original')}
                                className={`px-3 py-1.5 rounded-md transition-colors ${resizeMode === 'original' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                            >Original</button>
                            <button
                                onClick={() => setResizeMode('google-landscape')}
                                className={`px-3 py-1.5 rounded-md transition-colors ${resizeMode === 'google-landscape' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                            >16:9 (News)</button>
                            <button
                                onClick={() => setResizeMode('google-square')}
                                className={`px-3 py-1.5 rounded-md transition-colors ${resizeMode === 'google-square' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                            >1:1 (Square)</button>
                        </div>
                    </div>

                </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default ImageConverter;
