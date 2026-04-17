import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Stethoscope, FileText, CheckCircle2, Circle, RefreshCw } from 'lucide-react';
import { AnalysisResult } from '@/types';
import { apiPostJson } from '@/services/api';
import { motion, AnimatePresence } from 'motion/react';

export default function PreliminaryDiagnosis() {
  const location = useLocation();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState({
    has_itching_or_pain: false,
    has_recent_changes: false,
    has_similar_lesions: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
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
    summary: '根据图像分析，该病灶表现出一定的不典型性。主要特征包括边缘不规则和颜色不均匀。虽然直径尚未超过 6mm，但考虑到其不对称性和演变历史，建议密切关注。',
    recommendation: '建议您在 **2周内** 预约皮肤科医生进行进一步检查（如皮肤镜检查）。',
    diseases: [
      { disease: '非典型增生痣', probability: 65, description: '由于边缘不规则和颜色不均匀，这是最可能的初步判断。' },
      { disease: '普通色素痣', probability: 25, description: '虽然有轻微变化，但仍可能是良性的普通痣。' },
      { disease: '早期黑色素瘤', probability: 10, description: '由于存在不对称和演变，不能完全排除早期恶变的可能，需由医生确诊。' }
    ],
    initialQuestion: '为了更准确地评估，请问这个病灶出现多久了？最近有发痒、疼痛或出血的症状吗？'
  };

  const result = (location.state?.result as AnalysisResult) || mockResult;

  const handleGenerateReport = async () => {
    if (!result || result.id === 'mock-1') return;

    setIsGenerating(true);
    try {
      const reportResponse = await apiPostJson(`/analysis/${result.id}/report`, answers);
      const backendData = reportResponse.data;

      if (!backendData) throw new Error("No data returned");

      // Merge health advice into the result object with rich formatting
      const advice = backendData.health_advice;
      const finalResult: AnalysisResult = {
        ...result,
        summary: advice?.symptoms_description || '分析完成，请参考下方建议。',
        recommendation: advice?.medical_advice || '建议咨询医生获取具体建议。',
        recommendedTreatment: advice?.recommended_treatment,
        dailyCare: advice?.daily_care,
        medicalAdvice: advice?.medical_advice,
        patientInfo: backendData.user ? {
          age: backendData.user.age,
          gender: backendData.user.gender,
          blood_type: backendData.user.blood_type,
          height: backendData.user.height,
          weight: backendData.user.weight,
        } : undefined
      };

      navigate('/result', { state: { result: finalResult } });
    } catch (error) {
      console.error("Report generation failed:", error);
      alert("报告生成失败，请重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pb-10 flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b border-slate-100">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-semibold text-slate-800">初步诊断</h1>
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* Possible Diseases */}
        {result.diseases && result.diseases.length > 0 && (
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Stethoscope size={18} className="text-teal-500" />
              可能疾病概率
            </h3>
            <div className="space-y-4">
              {result.diseases.map((d, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-700">{d.disease}</span>
                    <span className="font-bold text-teal-600">{d.probability}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-500 h-2 rounded-full"
                      style={{ width: `${d.probability}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500">{d.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Questionnaire Form */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-teal-500" />
            进一步问诊
          </h3>

          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">1. 该部位是否有瘙痒或疼痛？</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setAnswers(prev => ({ ...prev, has_itching_or_pain: true }))}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${answers.has_itching_or_pain ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-slate-200 text-slate-600'}`}
                >
                  是
                </button>
                <button
                  onClick={() => setAnswers(prev => ({ ...prev, has_itching_or_pain: false }))}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${!answers.has_itching_or_pain ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-slate-200 text-slate-600'}`}
                >
                  否
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">2. 该病灶近期是否有明显变化（增大、变色等）？</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setAnswers(prev => ({ ...prev, has_recent_changes: true }))}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${answers.has_recent_changes ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-slate-200 text-slate-600'}`}
                >
                  是
                </button>
                <button
                  onClick={() => setAnswers(prev => ({ ...prev, has_recent_changes: false }))}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${!answers.has_recent_changes ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-slate-200 text-slate-600'}`}
                >
                  否
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">3. 身上其他部位是否有类似的皮损？</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setAnswers(prev => ({ ...prev, has_similar_lesions: true }))}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${answers.has_similar_lesions ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-slate-200 text-slate-600'}`}
                >
                  是
                </button>
                <button
                  onClick={() => setAnswers(prev => ({ ...prev, has_similar_lesions: false }))}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${!answers.has_similar_lesions ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-slate-200 text-slate-600'}`}
                >
                  否
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Action Button inline instead of fixed */}
        <div className="pt-0">
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating || result.id === 'mock-1'} // Disable if mock or generating
            className={`w-full py-3.5 rounded-xl font-medium shadow-lg flex items-center justify-center gap-2 transition-all ${isGenerating ? 'bg-teal-400 text-white cursor-not-allowed' : 'bg-teal-600 text-white shadow-teal-200 active:scale-[0.98]'}`}
          >
            {isGenerating ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <RefreshCw size={18} />
                </motion.div>
                报告生成中...
              </>
            ) : (
              <>
                <FileText size={18} />
                <span className="font-bold">生成问诊报告</span>
              </>
            )}
          </button>
        </div>
        
        {/* Physical spacer to push content above fixed bottom nav */}
        <div className="h-40"></div>
      </div>
    </div>
  );
}
