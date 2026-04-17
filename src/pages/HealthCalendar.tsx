import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  parseISO
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { AnalysisResult } from '@/types';
import { cn } from '@/lib/utils';
import { apiGetJson } from '../services/api';

export default function HealthCalendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiGetJson('/history/');
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
          recommendation: item.health_advice?.medical_advice || '建议复查'
        }));
        setHistory(fetchedHistory);
      } catch (error) {
        console.error('Failed to load history for calendar:', error);
      }
    };
    fetchHistory();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const getDayRecords = (day: Date) => {
    return history.filter(item => isSameDay(parseISO(item.date), day));
  };

  const selectedDayRecords = getDayRecords(selectedDate);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="pb-8 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-semibold text-slate-800">健康日历</h1>
        <button 
          onClick={() => {
            const today = new Date();
            setCurrentDate(today);
            setSelectedDate(today);
          }}
          className="p-2 -mr-2 text-teal-600 text-sm font-medium"
        >
          今天
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Calendar Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between p-4 border-b border-slate-50">
            <button onClick={prevMonth} className="p-1 text-slate-400 hover:text-slate-600">
              <ChevronLeft size={20} />
            </button>
            <h2 className="font-semibold text-slate-800">
              {format(currentDate, 'yyyy年 MM月', { locale: zhCN })}
            </h2>
            <button onClick={nextMonth} className="p-1 text-slate-400 hover:text-slate-600">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Week Headers */}
          <div className="grid grid-cols-7 text-center py-2 bg-slate-50/50">
            {weekDays.map(day => (
              <div key={day} className="text-xs text-slate-400 font-medium py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 text-center p-2 gap-y-2">
            {calendarDays.map((day, idx) => {
              const records = getDayRecords(day);
              const hasRecords = records.length > 0;
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div key={idx} className="flex flex-col items-center justify-center relative h-10">
                  <button
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all relative z-10",
                      !isCurrentMonth && "text-slate-300",
                      isSelected 
                        ? "bg-teal-600 text-white shadow-md shadow-teal-200" 
                        : isToday 
                          ? "text-teal-600 font-bold bg-teal-50" 
                          : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                  {hasRecords && !isSelected && (
                    <div className="w-1 h-1 rounded-full bg-teal-500 absolute bottom-1"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Records */}
        <div>
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <CalendarIcon size={18} className="text-teal-500" />
            {format(selectedDate, 'M月d日', { locale: zhCN })} 记录
            <span className="text-xs font-normal text-slate-400 ml-auto bg-slate-100 px-2 py-1 rounded-full">
              {selectedDayRecords.length} 条记录
            </span>
          </h3>

          <div className="space-y-3">
            {selectedDayRecords.length > 0 ? (
              selectedDayRecords.map((record) => (
                <Link
                  key={record.id}
                  to="/result"
                  state={{ result: record }}
                  className="block bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:border-teal-200 transition-colors"
                >
                  <div className="flex gap-3">
                    <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={record.imageUrl} alt="Record" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mb-1 inline-block ${
                          record.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                          record.riskLevel === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {record.riskLevel === 'high' ? '高风险' : record.riskLevel === 'medium' ? '中等' : '低风险'}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={10} />
                          {format(parseISO(record.date), 'HH:mm')}
                        </span>
                      </div>
                      <div 
                        className="text-xs text-slate-600 line-clamp-1 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: record.summary }}
                      />
                    </div>
                    <div className="flex items-center text-slate-300">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">该日暂无分析记录</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
