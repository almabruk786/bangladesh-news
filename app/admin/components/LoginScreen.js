export default function LoginScreen({ onLogin, u, p, setU, setP }) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Portal<span className="text-red-600">X</span></h1>
                    <p className="text-slate-400 mt-2">Sign in to access control panel</p>
                </div>

                <form onSubmit={onLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Username</label>
                        <input
                            type="text"
                            placeholder="Enter username"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                            value={u}
                            onChange={e => setU(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                            value={p}
                            onChange={e => setP(e.target.value)}
                        />
                    </div>

                    <button className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95">
                        Sign In
                    </button>

                    {/* <p className="text-xs text-center text-slate-400 pt-4 border-t border-slate-50 mt-4">
             Forgot credentials? Contact system administrator.
          </p> */}
                </form>
            </div>
        </div>
    );
}
