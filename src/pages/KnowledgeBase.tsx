import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { apiGetJson } from '../services/api';

import { motion } from 'motion/react';

export default function KnowledgeBase() {
  const navigate = useNavigate();

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await apiGetJson('/knowledge/');
      setArticles(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-emerald-400/10 to-transparent -z-10" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <div className="px-6 pt-12 pb-6 sticky top-0 bg-slate-50/80 backdrop-blur-lg z-20">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">健康百科</h1>
      </div>

      <div className="px-6 pb-28 space-y-6 relative z-10">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="搜索百科条目..."
            className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 premium-shadow transition-all"
          />
        </div>

        {/* List Layout */}
        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
               百科内容加载中...
             </div>
          ) : (
            articles.map((article, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={article.id}
              >
                <Link 
                  to={`/article/${article.id}`} 
                  state={{ article }}
                  className="bg-white p-4 rounded-3xl border border-slate-50 premium-shadow flex gap-5 hover:border-emerald-200 group transition-all active:scale-98"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex-shrink-0 overflow-hidden ring-2 ring-slate-50 group-hover:ring-emerald-50 transition-all">
                    <img src={article.img || `https://picsum.photos/seed/${article.id}/200/200`} alt={article.title} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-300" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">健康专题</span>
                    <h4 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">{article.title}</h4>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
