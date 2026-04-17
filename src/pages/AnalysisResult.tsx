import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Download, AlertTriangle, CheckCircle, Info, AlertCircle, Calendar, Activity, Stethoscope, Trash2, MessageCircle } from 'lucide-react';
import { AnalysisResult } from '@/types';
import { apiDelete } from '../services/api';

export default function AnalysisResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Mock result for demonstration if no state is provided
  const mockResult: AnalysisResult = {
    id: 'mock-1',
    date: new Date().toISOString(),
    imageUrl: 'https://picsum.photos/seed/skin-analysis/800/600',
    riskLevel: 'medium',
    abcde: {
      asymmetry: { description: '病灶形状略显不对称，左侧边缘比右侧更不规则。', score: 0.6 },
      border: { description: '边缘模糊不清，呈现锯齿状，与周围皮肤分界不明显。', score: 0.7 },
      color: { description: '颜色不均匀，中心呈现深褐色，边缘有淡红色晕圈。', score: 0.5 },
      diameter: { description: '直径约为 5.5mm，接近 6mm 的警戒值。', score: 0.4 },
      evolving: { description: '据患者描述，该病灶在过去三个月内有轻微增大和颜色加深的趋势。', score: 0.6 }
    },
    summary: '<p>根据图像分析，该病灶表现出一定的不典型性。主要特征包括边缘不规则和颜色不均匀。虽然直径尚未超过 6mm，但考虑到其不对称性和演变历史，建议密切关注。</p>',
    recommendation: '建议您在 <strong>2周内</strong> 预约皮肤科医生进行进一步检查。',
    recommendedTreatment: '<ul><li>保持患处清洁干燥</li><li>如出现瘙痒，可使用生理盐水冷敷</li><li>暂不建议自行外涂刺激性药物</li></ul>',
    dailyCare: '<ul><li>避免挤压、摩擦或过度搔抓</li><li>出门采取硬防晒（如撑伞、遮挡）</li><li>记录病灶的大小和颜色变化</li></ul>',
    medicalAdvice: '<p>建议您在 <strong>2周内</strong> 预约皮肤科医生进行进一步检查。如出现以下情况请立即就医：</p><ul><li>病灶迅速增大</li><li>明显瘙痒或疼痛</li><li>破溃或出血</li></ul>',
    diseases: [
      { disease: '非典型增生痣', probability: 65, description: '由于边缘不规则和颜色不均匀，这是最可能的初步判断。' },
      { disease: '普通色素痣', probability: 25, description: '虽然有轻微变化，但仍可能是良性的普通痣。' },
      { disease: '早期黑色素瘤', probability: 10, description: '由于存在不对称和演变，不能完全排除早期恶变的可能，需由医生确诊。' }
    ],
    initialQuestion: '为了更准确地评估，请问这个病灶出现多久了？最近有发痒、疼痛或出血的症状吗？'
  };

  const result = (location.state?.result as AnalysisResult) || mockResult;

  const handleDelete = async () => {
    if (!result.id || result.id.startsWith('mock-')) {
      navigate('/');
      return;
    }

    if (window.confirm('确定要删除这条分析记录吗？此操作不可撤销。')) {
      try {
        const response = await apiDelete(`/analysis/${result.id}`);
        if (response.success) {
          navigate('/history');
        } else {
          alert('删除失败: ' + (response.message || '未知错误'));
        }
      } catch (error) {
        console.error('Delete failed:', error);
        alert('删除请求失败，请稍后重试');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-100';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'low': return 'text-green-600 bg-green-50 border-green-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'high': return '高风险';
      case 'medium': return '中等风险';
      case 'low': return '低风险';
      default: return '未知';
    }
  };

  // Helper to safely get value and score
  const getABCDEData = (item: any) => {
    if (typeof item === 'string') {
      return { value: item, score: 0 }; // Default score for old data
    }
    return { value: item?.description || '无数据', score: item?.score || 0 };
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Print & Layout Overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Force layout to expand to full content height */
          html, body, #root, [class*="h-screen"], main {
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            position: static !important;
          }
          
          /* Hide non-report elements */
          nav, .sticky, button, .pdf-exclude, .ai-chat-bubble, [class*="fixed"] {
            display: none !important;
          }

          /* Reset max-width constraints from Layout.tsx */
          [class*="max-w-md"] {
            max-width: none !important;
            width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          /* Ensure the background is white for printing */
          body {
            background-color: white !important;
          }

          .print-container {
            padding: 0 !important;
            background: white !important;
          }
        }
      `}} />

      {/* Header (Hidden in Print/PDF) */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b border-slate-100 pdf-exclude">
        <button onClick={() => navigate('/history')} className="p-2 -ml-2 text-slate-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-semibold text-slate-800">分析报告</h1>
        <div className="flex items-center gap-1 -mr-2">
          <button onClick={handleDelete} className="p-2 text-red-400 hover:text-red-600" title="删除记录">
            <Trash2 size={20} />
          </button>
          <button 
            onClick={handlePrint} 
            className="p-2 text-slate-400 hover:text-emerald-600 active:scale-90 transition-all" 
            title="打印或导出 PDF"
          >
            <Download size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 bg-slate-50">
        {/* Image & Risk Banner */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          <div className="aspect-video bg-slate-100 relative">
            <img 
              src={result.imageUrl} 
              alt="Analyzed" 
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex justify-between items-end">
              <p className="text-white/90 text-xs flex items-center gap-1">
                <Calendar size={12} />
                {new Date(result.date).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Profile / Basic Situation */}
        {result.patientInfo && (
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-3 uppercase tracking-tight">
              <Activity size={20} className="text-emerald-500" />
              基本情况
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
              <ProfileItem label="年龄" value={result.patientInfo.age} />
              <ProfileItem label="性别" value={result.patientInfo.gender} />
              <ProfileItem label="血型" value={result.patientInfo.blood_type} />
              <ProfileItem label="身高" value={result.patientInfo.height} />
              <ProfileItem label="体重" value={result.patientInfo.weight} />
            </div>
          </section>
        )}

        {/* Medical Assistant Button */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden pdf-exclude">
          <div className="p-5">
            <button 
              onClick={() => navigate('/medical-assistant')}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/20"
            >
              <MessageCircle size={20} strokeWidth={2.5} />
              咨询 AI 护肤助手
            </button>
          </div>
        </section>

          <section className="bg-white rounded-3xl pt-6 pb-6 pr-6 pl-4 premium-shadow border border-slate-50 border-l-8 border-l-emerald-500 overflow-hidden relative">
            <div className="absolute -top-6 -right-6 p-4 opacity-[0.05] text-emerald-500">
              <Stethoscope size={100} />
            </div>
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-3 uppercase tracking-tight">
              <Stethoscope size={22} className="text-emerald-500" />
              推荐治疗方案
            </h3>
            <div 
              className="text-sm text-slate-500 leading-relaxed markdown-body font-medium italic"
              dangerouslySetInnerHTML={{ __html: result.recommendedTreatment }}
            />
          </section>

        {/* Daily Care Section */}
        {result.dailyCare && (
          <section className="bg-white rounded-2xl pt-5 pb-5 pr-5 pl-4 shadow-sm border border-slate-100 border-l-4 border-l-blue-500 overflow-hidden relative">
             <div className="absolute -top-6 -right-6 p-4 opacity-[0.03]">
              <Activity size={80} />
            </div>
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              日常护理建议
            </h3>
            <div 
              className="text-sm text-slate-600 leading-relaxed markdown-body"
              dangerouslySetInnerHTML={{ __html: result.dailyCare }}
            />
          </section>
        )}

        {/* Expert Medical Advice Section */}
        {(result.medicalAdvice || result.recommendation) && (
          <section className="bg-white rounded-2xl pt-5 pb-5 pr-5 pl-4 shadow-sm border border-slate-100 border-l-4 border-l-indigo-600 overflow-hidden relative">
            <div className="absolute -top-6 -right-6 p-4 opacity-[0.03]">
              <CheckCircle size={80} />
            </div>
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <AlertCircle size={20} className="text-indigo-600" />
              专家医疗建议
            </h3>
            <div 
              className="text-sm text-slate-600 leading-relaxed markdown-body"
              dangerouslySetInnerHTML={{ __html: result.medicalAdvice || result.recommendation || '' }}
            />
          </section>
        )}

        {/* Summary */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-900 mb-4 flex items-center gap-3 uppercase tracking-tight">
            <Info size={20} className="text-emerald-500" /> 
            分析摘要
          </h3>
          <div 
            className="text-sm text-slate-600 leading-relaxed markdown-body"
            dangerouslySetInnerHTML={{ __html: String(result.summary) }}
          />
        </section>

        {/* Risk Result (Moved to bottom) */}
        <div className={`rounded-2xl p-4 flex items-center justify-between shadow-sm border ${getRiskColor(result.riskLevel)}`}>
          <div>
            <p className="text-xs opacity-80 font-medium uppercase tracking-wider mb-1">AI 评估结果</p>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {result.riskLevel === 'high' ? <AlertTriangle size={24} /> : 
               result.riskLevel === 'medium' ? <AlertCircle size={24} /> : 
               <CheckCircle size={24} />}
              {getRiskLabel(result.riskLevel)}
            </h2>
          </div>
          <div className="flex flex-col items-end">
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-slate-400 text-center px-4">
          免责声明：本分析结果由人工智能生成，仅供参考，不能替代专业医疗诊断。如有不适，请及时就医。
        </p>
      </div>
    </div>
  );
}

function ABCDEItem({ label, value, score }: { label: string, value: string, score: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 0.7) return 'text-red-600 bg-red-50 border-red-100';
    if (s >= 0.4) return 'text-orange-600 bg-orange-50 border-orange-100';
    return 'text-green-600 bg-green-50 border-green-100';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 0.7) return '高风险';
    if (s >= 0.4) return '中风险';
    return '低风险';
  };

  return (
    <div className="p-4 hover:bg-slate-50/50 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded border ${getScoreColor(score)}`}>
          {getScoreLabel(score)}
        </span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{value}</p>
    </div>
  );
}

function ProfileItem({ label, value }: { label: string, value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}
