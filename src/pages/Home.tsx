import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Activity, AlertCircle, ChevronRight, Calendar, MessageCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { apiGetJson } from '../services/api';
import { AnalysisResult } from '@/types';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedArticles, setRecommendedArticles] = useState<any[]>([]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await apiGetJson('/history/?limit=1');
        if (response.data && response.data.length > 0) {
          const item = response.data[0];
          const mapped: AnalysisResult = {
            id: item.id.toString(),
            date: item.created_at,
            imageUrl: item.image?.file_path || 'https://via.placeholder.com/400',
            riskLevel: item.confidence > 0.8 ? 'high' : (item.confidence > 0.5 ? 'medium' : 'low'),
            abcde: {
              asymmetry: { description: item.features?.asymmetry || '-', score: 0 },
              border: { description: item.features?.border || '-', score: 0 },
              color: { description: item.features?.color || '-', score: 0 },
              diameter: { description: item.features?.diameter || '-', score: 0 },
              evolving: { description: '-', score: 0 }
            },
            summary: item.health_advice?.symptoms_description || item.disease_type || '分析完成，请查看详情',
            recommendation: item.health_advice?.medical_advice || '暂无建议',
            recommendedTreatment: item.health_advice?.recommended_treatment || undefined,
            dailyCare: item.health_advice?.daily_care || undefined,
            medicalAdvice: item.health_advice?.medical_advice || undefined,
            patientInfo: item.user ? {
              age: item.user.age,
              gender: item.user.gender,
              blood_type: item.user.blood_type,
              height: item.user.height,
              weight: item.user.weight,
            } : undefined,
            diseases: item.disease_type ? [{
              disease: item.disease_type,
              probability: Math.round(item.confidence * 100),
              description: ''
            }] : []
          };
          setLatestAnalysis(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch latest analysis:', error);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchArticles = async () => {
      try {
        const response = await apiGetJson('/knowledge/?limit=4');
        setRecommendedArticles(response.data || []);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      }
    };
    fetchLatest();
    fetchArticles();
  }, []);

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    return `${diffDays}天前`;
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早安';
    if (hour < 18) return '午安';
    return '晚安';
  };


  return (
    <div className="p-5 space-y-8 pb-28 relative">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl shadow-emerald-500/20 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity size={120} />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight italic">
            {getTimeGreeting()}, {user?.username || '用户'}
          </h2>
          <p className="text-sky-50 font-medium opacity-80 text-sm mb-8 max-w-[80%]">
            保持关注，守护每一寸肌肤的健康与活力。
          </p>
          
          <div className="flex items-center gap-4">
            <Link to="/analyze" className="bg-white text-emerald-600 px-6 py-3 rounded-2xl font-bold text-sm inline-flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all">
              <Camera size={18} strokeWidth={2.5} />
              即刻分析
            </Link>
            <Link to="/medical-assistant" className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl text-white font-bold text-sm inline-flex items-center gap-2 hover:bg-white/20 transition-all border border-white/20">
              <MessageCircle size={18} strokeWidth={2.5} />
              AI 助手
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-5">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl premium-shadow border border-slate-50 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <Activity size={16} className="text-emerald-500" />
            <span className="text-[11px] uppercase tracking-wider font-bold">健康评分</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-slate-900 leading-none">
              {latestAnalysis ? (latestAnalysis.riskLevel === 'low' ? 95 : latestAnalysis.riskLevel === 'medium' ? 70 : 45) : '--'}
            </span>
            <span className="text-sm text-slate-400 font-bold uppercase">分</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl premium-shadow border border-slate-50 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-teal-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <Calendar size={16} className="text-teal-500" />
            <span className="text-[11px] uppercase tracking-wider font-bold">最近检测</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 leading-tight">
            {latestAnalysis ? getTimeAgo(latestAnalysis.date) : '无记录'}
          </div>
        </motion.div>
      </div>

      {/* Recent Analysis */}
      <section>
        <div className="flex items-center justify-between mb-5 px-1">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">分析档案</h3>
          <Link to="/history" className="text-xs text-emerald-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
            历史详情 <ChevronRight size={14} />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="bg-white/50 rounded-3xl border border-slate-100 p-16 flex flex-col items-center justify-center text-slate-300 gap-4">
             <div className="relative">
               <RefreshCcw className="animate-spin" size={32} />
               <div className="absolute inset-0 blur-lg bg-emerald-400/20 animate-pulse" />

             </div>
             <p className="text-xs font-bold uppercase tracking-widest">数据同步中</p>
          </div>
        ) : latestAnalysis ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] premium-shadow overflow-hidden border border-slate-50 group hover:border-emerald-100 transition-colors"
          >
            <div className="p-5">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex-shrink-0 overflow-hidden ring-4 ring-slate-50 transition-transform group-hover:scale-105 duration-500">
                   <img src={latestAnalysis.imageUrl} alt="Skin" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-extrabold text-slate-900 text-lg truncate">智能诊断报告</h4>
                    <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${
                      latestAnalysis.riskLevel === 'high' ? 'bg-rose-50 text-rose-600' :
                      latestAnalysis.riskLevel === 'medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      {latestAnalysis.riskLevel === 'high' ? '高危预警' : latestAnalysis.riskLevel === 'medium' ? '中度观察' : '健康稳定'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(latestAnalysis.date).toLocaleDateString()}
                  </p>
                  <div 
                    className="text-sm font-bold text-slate-600 line-clamp-1 italic"
                    dangerouslySetInnerHTML={{ __html: latestAnalysis.summary }}
                  />
                </div>
              </div>
            </div>
            <Link 
              to="/result" 
              state={{ result: latestAnalysis }}
              className="block py-4 text-center text-[13px] text-slate-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all border-t border-slate-50 font-black tracking-widest uppercase"
            >
              查阅完整分析报告
            </Link>
          </motion.div>
        ) : (
          <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center">
            <p className="text-sm font-bold text-slate-400">目前没有任何分析记录</p>
            <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-tighter">立刻上传照片开始第一次咨询</p>
          </div>
        )}
      </section>


      {/* Recommended Reading */}
      <section className="pb-6">
        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-5 px-1">健康百科</h3>
        <div className="grid grid-cols-1 gap-4">
          {recommendedArticles.map((article, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={article.id}
            >
              <Link 
                to={`/article/${article.id}`}
                state={{ article: { ...article, category: '科普', readTime: '5 min' } }}
                className="bg-white rounded-3xl p-4 premium-shadow border border-slate-50 flex items-center gap-5 hover:border-sky-200 transition-all group active:scale-98"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-slate-50 group-hover:ring-sky-50 transition-all">
                  <img src={article.img || `https://picsum.photos/seed/${article.id}/200/200`} alt="Article" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 block">科普专题</span>
                  <h4 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">{article.title}</h4>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                  <ChevronRight size={18} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>

  );
}
