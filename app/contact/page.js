"use client";
import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // এখানে ভবিষ্যতে আসল ইমেইল সেন্ডিং লজিক যোগ করা যাবে (যেমন EmailJS বা API)
    console.log("Form Data:", formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <main className="max-w-6xl mx-auto px-4 py-12">

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">আমাদের সাথে যোগাযোগ করুন</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            আপনার কোনো মতামত, অভিযোগ বা পরামর্শ থাকলে নিচের ফর্মে আমাদের জানান। আমরা দ্রুত আপনার সাথে যোগাযোগ করব।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">ইমেইল</h3>
                <p className="text-slate-500 text-sm mb-1">যেকোনো তথ্যের জন্য মেইল করুন</p>
                <a href="mailto:contact@bangladeshnews.com" className="text-blue-600 font-semibold hover:underline">contact@bangladeshnews.com</a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">ফোন</h3>
                <p className="text-slate-500 text-sm mb-1">সকাল ১০টা থেকে সন্ধ্যা ৬টা</p>
                <p className="text-slate-800 font-semibold">+880 1234 567890</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">অফিস</h3>
                <p className="text-slate-500 text-sm mb-1">আমাদের প্রধান কার্যালয়</p>
                <p className="text-slate-800 font-semibold">কারওয়ান বাজার, ঢাকা-১২১৫, বাংলাদেশ</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <Send size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">ধন্যবাদ!</h3>
                <p className="text-slate-600">আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে।</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">আপনার নাম</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition"
                    placeholder="নাম লিখুন"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ইমেইল</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition"
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">বার্তা</label>
                  <textarea
                    required
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition resize-none"
                    placeholder="আপনার বার্তা লিখুন..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-lg transition shadow-md flex items-center justify-center gap-2"
                >
                  <Send size={18} /> বার্তা পাঠান
                </button>
              </form>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}