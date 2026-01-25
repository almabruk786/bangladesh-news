import { useState, useEffect } from "react";
import { Users, Trash2, UserPlus, Key } from "lucide-react";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function UserManager() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ name: "", username: "", password: "", role: "publisher" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            // Check cache first
            const cacheKey = 'admin_users_cache';
            const cached = sessionStorage.getItem(cacheKey);
            const cacheTime = sessionStorage.getItem(cacheKey + '_time');
            const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
            const isCacheValid = cacheTime && (Date.now() - parseInt(cacheTime) < CACHE_DURATION);

            if (isCacheValid && cached) {
                console.log('[UserManager] Using cached users');
                setUsers(JSON.parse(cached));
                setLoading(false);
                return;
            }

            console.log('[UserManager] Cache miss - fetching users from Firestore');
            const snap = await getDocs(collection(db, "users"));
            const usersData = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            // Cache the results
            sessionStorage.setItem(cacheKey, JSON.stringify(usersData));
            sessionStorage.setItem(cacheKey + '_time', Date.now().toString());

            setUsers(usersData);
            setLoading(false);
        };

        fetchUsers();
    }, []);

    const createUser = async (e) => {
        e.preventDefault();
        if (!newUser.name || !newUser.username || !newUser.password) return;

        const docRef = await addDoc(collection(db, "users"), { ...newUser });

        // Clear cache and update state
        sessionStorage.removeItem('admin_users_cache');
        sessionStorage.removeItem('admin_users_cache_time');
        setUsers([...users, { id: docRef.id, ...newUser }]);
        setNewUser({ name: "", username: "", password: "", role: "publisher" });
        alert(`${newUser.role === 'writer' ? 'Writer' : 'Publisher'} added successfully!`);
    };

    const deleteUser = async (id) => {
        if (confirm("Are you sure you want to remove this user?")) {
            await deleteDoc(doc(db, "users", id));

            // Clear cache and update state
            sessionStorage.removeItem('admin_users_cache');
            sessionStorage.removeItem('admin_users_cache_time');
            setUsers(users.filter(u => u.id !== id));
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create User Form */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                        <UserPlus className="text-blue-500" /> Add Team Member
                    </h3>
                    <form onSubmit={createUser} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                            <input
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                                value={newUser.name}
                                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
                            <input
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                                value={newUser.username}
                                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                            <select
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1 font-bold"
                                value={newUser.role}
                                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                            >
                                <option value="publisher">Publisher (Can view own news)</option>
                                <option value="writer">Writer (Write Only - Quota Safe)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    required
                                    className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                        </div>
                        <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                            Create Account
                        </button>
                    </form>
                </div>
            </div>

            {/* User List */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <Users className="text-slate-500" /> Team Members
                        </h3>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Loading team...</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <tr key="header-row">
                                    <th className="p-5">Name</th>
                                    <th className="p-5">Username</th>
                                    <th className="p-5">Role</th>
                                    <th className="p-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.map(u => (
                                    <tr key={u.id} className="group hover:bg-slate-50/50">
                                        <td className="p-5 font-bold text-slate-700">{u.name}</td>
                                        <td className="p-5 text-slate-500">@{u.username}</td>
                                        <td className="p-5">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${u.role === 'writer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {u.role || 'publisher'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button onClick={() => deleteUser(u.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr><td colSpan="4" className="p-8 text-center text-slate-400">No additional users found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
