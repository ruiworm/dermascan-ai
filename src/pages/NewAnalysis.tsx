import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, X, RefreshCw, ChevronLeft, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch, apiPostJson } from '../services/api';

export default function NewAnalysis() {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const navigate = useNavigate();

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
      setCameraActive(false);
    }
  }, [webcamRef]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgSrc(reader.result as string);
        setCameraActive(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const retake = () => {
    setImgSrc(null);
    setCameraActive(true);
  };

  const handleAnalyze = async () => {
    if (!imgSrc) return;

    setIsAnalyzing(true);
    try {
      // 1. Convert base64 to Blob
      const fetchResponse = await fetch(imgSrc);
      const blob = await fetchResponse.blob();

      const formData = new FormData();
      formData.append('file', blob, 'capture.jpg');

      // 2. Upload image
      const uploadRes = await apiFetch('/analysis/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      const imageId = uploadData.data.id;

      // 3. Analyze image
      const analyzeData = await apiPostJson('/analysis/analyze', {
        image_id: imageId
      });

      const analysisResult = analyzeData.data;

      // 4. Map backend response to frontend AnalysisResult type
      const historyItem = {
        id: analysisResult.id.toString(),
        date: analysisResult.created_at,
        imageUrl: imgSrc,
        riskLevel: analysisResult.confidence > 0.8 ? 'high' : (analysisResult.confidence > 0.5 ? 'medium' : 'low'),
        abcde: {
          asymmetry: { description: analysisResult.features?.asymmetry || '等待进一步临床诊断', score: 0.5 },
          border: { description: analysisResult.features?.border || '边界特征提取中', score: 0.5 },
          color: { description: analysisResult.features?.color || '多色性评估正常', score: 0.5 },
          diameter: { description: analysisResult.features?.diameter || '直径小于6mm', score: 0.3 },
          evolving: { description: '建议定期跟进拍照观察', score: 0.2 }
        },
        summary: '等待补充患者情况以生成完整报告...',
        recommendation: '请回答后续问题。',
        diseases: analysisResult.features?.top_predictions
          ? analysisResult.features.top_predictions.map((p: any) => ({
            disease: p.zh || p.en,
            probability: Math.round(p.probability),
            description: ''
          }))
          : [
            {
              disease: analysisResult.disease_type || 'Unknown',
              probability: Math.round((analysisResult.confidence || 0) * 100),
              description: ''
            }
          ],
        initialQuestion: ''
      };

      navigate('/preliminary', { state: { result: historyItem } });
    } catch (error: any) {
      console.error("Analysis failed:", error);
      // Use the specific error message provided by the service or fallback
      const msg = error instanceof Error ? error.message : "请求发生未知错误，请重试。";
      alert(msg);
      
      if (msg.includes("SESSION_EXPIRED")) {
        navigate('/login');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-black relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-center items-center text-white bg-gradient-to-b from-black/60 to-transparent">
        <span className="font-medium">智能拍摄</span>
      </div>

      {/* Image/Camera Area (Larger view) */}
      <div className="h-[72dvh] w-full relative overflow-hidden flex items-center justify-center bg-zinc-950">
        {cameraActive ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="absolute inset-0 w-full h-full object-cover"
              videoConstraints={{ facingMode: "environment" }}
            />
            {/* Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-white/20 rounded-3xl relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-teal-400 -mt-1.5 -ml-1.5 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-teal-400 -mt-1.5 -mr-1.5 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-teal-400 -mb-1.5 -ml-1.5 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-teal-400 -mb-1.5 -mr-1.5 rounded-br-lg"></div>

                <motion.div
                  className="absolute left-0 right-0 h-1 bg-teal-400/30 shadow-[0_0_15px_rgba(45,212,191,0.4)]"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full p-2 flex items-center justify-center">
            <img
              src={imgSrc!}
              alt="Captured"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        )}
      </div>

      {/* Controls Area (Narrower & More compact) */}
      <div className="flex-1 bg-white rounded-t-[32px] p-4 pb-16 z-10 relative shadow-[0_-20px_40px_rgba(0,0,0,0.15)]">
        <div className="w-10 h-1 bg-slate-100 rounded-full mx-auto mb-6"></div>

        {imgSrc ? (
          <div className="space-y-4">
            <div className="flex gap-4">
              <button onClick={retake} className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium flex items-center justify-center gap-2">
                <RefreshCw size={18} /> 重拍
              </button>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex-1 py-3 px-4 rounded-xl bg-teal-600 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-teal-200 disabled:opacity-70"
              >
                {isAnalyzing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <RefreshCw size={18} />
                    </motion.div>
                    分析中...
                  </>
                ) : (
                  <>
                    <Zap size={18} /> 开始分析
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-around items-center">
            <label className="flex flex-col items-center gap-2 text-slate-400 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                <Upload size={20} />
              </div>
              <span className="text-xs">相册</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={capture}
              className="w-20 h-20 rounded-full bg-teal-500 border-4 border-teal-100 flex items-center justify-center shadow-xl shadow-teal-200 active:scale-95 transition-transform"
            >
              <Camera size={32} className="text-white" />
            </button>

            <div className="flex flex-col items-center gap-2 text-slate-400 opacity-50">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                <Zap size={20} />
              </div>
              <span className="text-xs">闪光灯</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
