import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus } from 'lucide-react';

export default function BodyMap() {
  const navigate = useNavigate();

  const bodyParts = [
    { id: 'head', name: '头部', count: 0 },
    { id: 'neck', name: '颈部', count: 1 },
    { id: 'torso', name: '躯干', count: 3 },
    { id: 'left-arm', name: '左臂', count: 2 },
    { id: 'right-arm', name: '右臂', count: 0 },
    { id: 'left-leg', name: '左腿', count: 1 },
    { id: 'right-leg', name: '右腿', count: 0 },
  ];

  return (
    <div className="pb-8 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-semibold text-slate-800">身体部位图</h1>
        <button className="p-2 -mr-2 text-teal-600">
          <Plus size={24} />
        </button>
      </div>

      <div className="p-4">
        {/* Body Map Visualization (Placeholder) */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-6 flex justify-center">
          <div className="relative w-48 h-96 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300">
            {/* Simple Body Silhouette Placeholder */}
            <svg viewBox="0 0 100 200" className="w-full h-full opacity-50">
              <circle cx="50" cy="20" r="15" fill="currentColor" />
              <rect x="35" y="40" width="30" height="70" rx="5" fill="currentColor" />
              <rect x="15" y="40" width="15" height="60" rx="5" fill="currentColor" />
              <rect x="70" y="40" width="15" height="60" rx="5" fill="currentColor" />
              <rect x="35" y="115" width="12" height="70" rx="5" fill="currentColor" />
              <rect x="53" y="115" width="12" height="70" rx="5" fill="currentColor" />
            </svg>
            
            {/* Mock Hotspots */}
            <div className="absolute top-[25%] left-[45%] w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
            <div className="absolute top-[40%] left-[30%] w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-sm"></div>
            <div className="absolute top-[60%] right-[35%] w-3 h-3 bg-teal-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
        </div>

        {/* Body Parts List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-slate-800 mb-2">部位记录</h2>
          {bodyParts.map((part) => (
            <div key={part.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center hover:border-teal-200 transition-colors">
              <span className="font-medium text-slate-700">{part.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{part.count} 个记录</span>
                <ChevronLeft size={16} className="rotate-180 text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
