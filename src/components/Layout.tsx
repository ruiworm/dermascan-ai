import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Camera, FileText, User, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';


interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: '首页', path: '/' },
    { icon: Camera, label: '分析', path: '/analyze' },
    { icon: FileText, label: '记录', path: '/history' },
    { icon: BookOpen, label: '百科', path: '/encyclopedia' },
    { icon: User, label: '我的', path: '/profile' },
  ];

  const isAnalyzePage = location.pathname === '/analyze';
  const isPreliminaryPage = location.pathname === '/preliminary';

  return (
    <div className="h-screen h-[100dvh] bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative overscroll-none border-x border-slate-100">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden max-w-md mx-auto">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[30%] bg-emerald-200/30 blur-3xl rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[30%] bg-teal-200/20 blur-3xl rounded-full" />
        <div className="absolute bottom-[10%] left-0 w-full h-[20%] bg-gradient-to-t from-white to-transparent" />
      </div>

      <main className={cn(
        "flex-1 scrollbar-hide flex flex-col relative z-10", 
        isAnalyzePage ? "overflow-hidden" : "overflow-y-auto overscroll-y-auto"
      )}>

        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="glass w-full z-20 safe-pb border-t border-white/40 mt-auto">

        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 relative",
                  isActive ? "text-emerald-600" : "text-slate-400 hover:text-slate-500"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="nav-glow"
                    className="absolute -top-1 w-8 h-1 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={cn("transition-transform duration-300", isActive && "scale-110")}
                />
                <span className={cn(
                  "text-[10px] font-semibold transition-all duration-300",
                  isActive ? "opacity-100" : "opacity-70"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>

  );
}
