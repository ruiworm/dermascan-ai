import React from 'react';
import { User, ChevronRight, FileText, Heart, Shield, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';


export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="pb-28 relative">
      {/* Header Profile Card */}
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 pt-12 pb-20 px-6 rounded-b-[4rem] text-white relative mb-16 shadow-2xl shadow-emerald-500/20">
        <div className="absolute inset-0 overflow-hidden rounded-b-[4rem] pointer-events-none">
          <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
            <User size={180} />
          </div>
        </div>
        
        <div className="flex items-center gap-5 relative z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-3xl font-black border-2 border-white/30 uppercase shadow-lg italic"
          >
            {user?.username?.[0] || 'U'}
          </motion.div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tight">{user?.username || '用户'}</h1>
            <p className="text-emerald-100 text-[11px] font-bold uppercase tracking-widest opacity-70">
              {user?.is_superuser ? 'Premium Administrator' : 'Advanced Analysis User'}
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute -bottom-10 left-6 right-6 bg-white rounded-[2.5rem] p-6 premium-shadow flex justify-around text-center border border-slate-50"
        >
          <div>
            <div className="text-2xl font-black text-slate-900 leading-tight">12</div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">检测</div>
          </div>
          <div className="w-px bg-slate-100/50"></div>
          <div>
            <div className="text-2xl font-black text-rose-500 leading-tight">0</div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">高危</div>
          </div>
          <div className="w-px bg-slate-100/50"></div>
          <div>
            <div className="text-2xl font-black text-emerald-500 leading-tight">92</div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">评分</div>
          </div>
        </motion.div>
      </div>

      {/* Menu List */}
      <div className="px-5 space-y-4">
        <div className="bg-white rounded-[2.5rem] p-3 premium-shadow border border-slate-50 space-y-1">
          <MenuItem icon={FileText} label="健康档案" to="/personal-history" />
          <MenuItem icon={User} label="身体地图" to="/body-map" />
          <MenuItem icon={Heart} label="健康日历" to="/health-calendar" />
        </div>

        <div className="bg-white rounded-[2.5rem] p-3 premium-shadow border border-slate-50 space-y-1">
          {user?.is_superuser && (
            <>
              <MenuItem 
                icon={Shield} 
                label="管理中枢" 
                to="/admin/knowledge" 
              />
              <div className="h-px bg-slate-50 mx-5 my-2"></div>
            </>
          )}
          
          <button onClick={logout} className="w-full flex items-center justify-between p-4 hover:bg-rose-50 rounded-2xl transition-all group active:scale-98">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
                <LogOut size={18} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-rose-600 transition-colors">安全退出</span>
            </div>
            <ChevronRight size={16} className="text-slate-200 group-hover:text-rose-300" />
          </button>
        </div>
      </div>
    </div>

  );
}


function MenuItem({ icon: Icon, label, to }: { icon: any, label: string, to?: string }) {
  const content = (
    <>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all shadow-sm">
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">{label}</span>
      </div>
      <ChevronRight size={16} className="text-slate-200 group-hover:text-emerald-300 transition-colors" />
    </>
  );

  const className = "w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group active:scale-98";

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button className={className}>
      {content}
    </button>
  );
}

