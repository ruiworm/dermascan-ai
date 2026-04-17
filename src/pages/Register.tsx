import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Mail, Lock, User, AlertCircle, ChevronLeft, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { apiPostJson } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 1. Check & Create User
            await apiPostJson('/users/register', {
                email,
                password,
                username
            }, false);

            // 2. Automatically login after registration by hitting the token endpoint using URLSearchParams
            const formData = new URLSearchParams();
            formData.append('username', email); // oauth2 requirement mapped to email fallback
            formData.append('password', password);

            const response = await fetch('/api/v1/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });

            if (!response.ok) throw new Error('Registered successfully but failed to auto-login');
            const data = await response.json();

            // 3. Inject into global state
            await login(data.access_token, '/');

        } catch (err: any) {
            setError(err.message || '注册失败，该邮箱可能已被注册');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[100dvh] bg-slate-50 flex flex-col relative w-full max-w-md mx-auto overflow-hidden border-x border-slate-100 shadow-2xl">
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-emerald-400/20 to-transparent -z-10" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-100/40 rounded-full blur-3xl -z-10" />
            <div className="absolute top-1/4 -right-32 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl -z-10" />

            {/* Top Header - Compact */}
            <div className="px-6 pt-10 pb-4 flex flex-col items-center justify-center relative z-20">
                <div className="absolute top-10 left-6">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white flex items-center justify-center rounded-xl text-slate-400 hover:text-emerald-600 shadow-lg border border-slate-50 active:scale-90 transition-all">
                        <ChevronLeft size={18} strokeWidth={2.5} />
                    </button>
                </div>
                <div className="font-black text-slate-400 text-[10px] tracking-[0.4em] uppercase italic opacity-80 mb-2">肤理通</div>
            </div>

            <div className="flex-1 px-8 pb-24 overflow-y-auto relative z-10 scrollbar-hide">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <h1 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">创建账户</h1>
                    <p className="text-slate-400 mb-8 text-xs font-medium">开启 AI 智能皮肤健康档案</p>

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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div className="group">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">全名 / 昵称</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-white border border-slate-100 text-slate-900 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 block p-4 pl-12 transition-all outline-none"
                                        placeholder="请输入您的昵称"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">常用邮箱</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white border border-slate-100 text-slate-900 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 block p-4 pl-12 transition-all outline-none"
                                        placeholder="user@example.com"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">设置密码</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white border border-slate-100 text-slate-900 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 block p-4 pl-12 transition-all outline-none"
                                        placeholder="至少 6 位密码"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full group text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xl shadow-emerald-500/40 outline-none font-black uppercase tracking-[0.2em] rounded-2xl text-xs px-5 py-5 text-center mt-6 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-between items-center"
                        >
                            {isLoading ? (
                                <div className="w-full flex justify-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>
                            ) : (
                                <>
                                    <span>确认并创建账户</span>
                                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm group-hover:translate-x-1 transition-transform">
                                        <ArrowRight size={16} strokeWidth={3} />
                                    </div>
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-xs font-bold text-slate-400 text-center mt-6 uppercase tracking-widest">
                        已有账户? <Link to="/login" className="text-emerald-600 hover:underline">返回登录界面</Link>
                    </p>

                    {/* Bottom Spacer for mobile visibility */}
                    <div className="h-32 safe-pb" />
                </motion.div>
            </div>
        </div>
    );
}

