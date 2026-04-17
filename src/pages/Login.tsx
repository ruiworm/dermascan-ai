import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Camera, Mail, Lock, AlertCircle, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAdminLogin, setIsAdminLogin] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as any)?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const formData = new URLSearchParams();
            // OAuth2PasswordRequestForm maps 'username' field to our email input
            formData.append('username', email);
            formData.append('password', password);

            const response = await apiFetch('/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
                requireAuth: false
            });

            const data = await response.json();
            // Redirect to admin portal if admin login is toggled
            const redirectTo = isAdminLogin ? '/admin' : from;
            await login(data.access_token, redirectTo);
        } catch (err: any) {
            setError(err.message || '登录失败，请检查账号密码');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[100dvh] bg-slate-50 flex flex-col relative w-full max-w-md mx-auto overflow-hidden border-x border-slate-100 shadow-2xl">
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-emerald-400/20 to-transparent -z-10" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-100/40 rounded-full blur-3xl -z-10" />
            <div className="absolute top-1/2 -left-32 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl -z-10" />

            {/* Top Header - Compact */}
            <div className="px-6 pt-10 pb-4 flex flex-col items-center justify-center relative z-20">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 bg-white text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/10 border border-slate-100"
                >
                    <Camera size={32} strokeWidth={2.5} />
                </motion.div>
                <div className="font-black text-slate-400 text-[10px] tracking-[0.4em] uppercase italic opacity-80 mb-2">肤理通</div>
            </div>

            <div className="flex-1 px-8 pb-24 overflow-y-auto relative z-10 scrollbar-hide">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <h1 className="text-3xl font-black text-slate-900 mb-1 text-center tracking-tight">欢迎回来</h1>
                    <p className="text-slate-400 text-center mb-8 text-xs font-medium">即刻开启您的 AI 皮肤管理之旅</p>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold flex items-start gap-3 mb-8 border border-rose-100"
                        >
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Role Toggle */}
                        <div className="flex bg-slate-200/50 backdrop-blur-sm p-1.5 rounded-2xl mb-6 border border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsAdminLogin(false)}
                                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isAdminLogin ? 'bg-white shadow-xl text-emerald-600' : 'text-slate-400 hover:text-slate-500'}`}
                            >
                                普通用户
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdminLogin(true)}
                                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isAdminLogin ? 'bg-white shadow-xl text-teal-600' : 'text-slate-400 hover:text-slate-500'}`}
                            >
                                管理员
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="group">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">账号/邮箱</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white border border-slate-100 text-slate-900 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 block p-4 pl-12 transition-all outline-none"
                                        placeholder="请输入邮箱或用户名"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">访问密码</label>
                                    {!isAdminLogin && <a href="#" className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:underline">密码找回</a>}
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white border border-slate-100 text-slate-900 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 block p-4 pl-12 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full text-white font-black uppercase tracking-[0.2em] rounded-2xl text-xs px-5 py-5 text-center mt-6 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center shadow-2xl ${isAdminLogin ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/30' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/40'}`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                isAdminLogin ? '进入管理中心' : '开启健康之旅'
                            )}
                        </button>
                    </form>


                    {!isAdminLogin && (
                        <p className="text-xs font-bold text-slate-400 text-center mt-6 uppercase tracking-widest">
                            还没有账户? <Link to="/register" className="text-emerald-600 hover:underline">立即注册新账号</Link>
                        </p>
                    )}

                    {/* Bottom Spacer for mobile visibility */}
                    <div className="h-32 safe-pb" />
                </motion.div>
            </div>
        </div>
    );
}
