import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, Search, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { AnalysisResult } from '@/types';


import { apiGetJson } from '../services/api';

export default function History() {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiGetJson('/history/');
        // Mapping backend response to frontend format
        const fetchedHistory = response.data.map((item: any) => ({
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
          summary: item.health_advice?.symptoms_description || item.disease_type || '分析完成',
          recommendation: item.health_advice?.medical_advice || '建议复查线下医生',
          recommendedTreatment: item.health_advice?.recommended_treatment || undefined,
          dailyCare: item.health_advice?.daily_care || undefined,
          medicalAdvice: item.health_advice?.medical_advice || undefined,
          gradcamUrl: item.features?.gradcam_url,
          patientInfo: item.user ? {
            age: item.user.age,
            gender: item.user.gender,
            blood_type: item.user.blood_type,
            height: item.user.height,
            weight: item.user.weight,
          } : undefined
        }));
        setHistory(fetchedHistory);
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-emerald-400/10 to-transparent -z-10" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <div className="px-6 pt-12 pb-6 sticky top-0 bg-slate-50/80 backdrop-blur-lg z-20">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">历史记录</h1>
      </div>

      <div className="px-6 pb-28 space-y-6 relative z-10">
        {/* Search/Filter */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="搜索您的检测记录"
            className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 premium-shadow transition-all"
          />
        </div>

        {/* Timeline */}
        <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>暂无历史记录</p>
          </div>
        ) : (
          history.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={item.id}
            >
              <Link
                to="/result"
                state={{ result: item }}
                className="block bg-white rounded-[2rem] p-4 premium-shadow border border-slate-50 hover:border-emerald-200 transition-all group active:scale-98"
              >
                <div className="flex gap-5">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-slate-50 group-hover:ring-emerald-50 transition-all">
                    <img src={item.imageUrl} alt="Thumbnail" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-opacity" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="font-bold text-slate-900 truncate">检测分析报告</h3>
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${
                        item.riskLevel === 'high' ? 'bg-rose-50 text-rose-600' :
                        item.riskLevel === 'medium' ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {item.riskLevel === 'high' ? '高危预警' : item.riskLevel === 'medium' ? '中度观察' : '健康稳定'}
                      </span>
                    </div>
                    <div 
                      className="text-xs text-slate-400 font-medium line-clamp-1 mb-2 italic"
                      dangerouslySetInnerHTML={{ __html: item.summary }}
                    />
                    <div className="flex items-center text-[10px] text-slate-400 font-black uppercase tracking-widest gap-1.5">
                      <Calendar size={12} className="text-emerald-500" />
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center text-slate-200 group-hover:text-emerald-300 transition-colors">
                    <ChevronRight size={20} strokeWidth={3} />
                  </div>
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
