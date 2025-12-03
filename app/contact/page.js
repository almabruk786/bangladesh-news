export default function Contact() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">যোগাযোগ করুন</h1>
        <p className="text-slate-600 mb-6">আপনার কোনো মতামত বা অভিযোগ থাকলে আমাদের জানান।</p>
        
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="font-bold text-slate-700">ইমেইল:</p>
            <p className="text-blue-600">contact@bangladeshnews.com</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="font-bold text-slate-700">ঠিকানা:</p>
            <p className="text-slate-600">ঢাকা, বাংলাদেশ</p>
          </div>
        </div>
      </div>
    </main>
  );
}