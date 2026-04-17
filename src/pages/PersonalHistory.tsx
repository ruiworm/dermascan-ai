import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, AlertCircle, FileText, Activity, Pill, Loader2, Save } from 'lucide-react';
import { apiGetJson, apiPutJson } from '../services/api';

export default function PersonalHistory() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for user info
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    blood_type: '',
    height: '',
    weight: '',
    allergies: [] as string[],
    conditions: [] as string[],
    medications: [] as string[],
    family_history: [] as string[]
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const data = await apiGetJson('/users/me');
      setFormData({
        age: data.age || '',
        gender: data.gender || '',
        blood_type: data.blood_type || '',
        height: data.height || '',
        weight: data.weight || '',
        allergies: data.allergies ? JSON.parse(data.allergies) : [],
        conditions: data.conditions ? JSON.parse(data.conditions) : [],
        medications: data.medications ? JSON.parse(data.medications) : [],
        family_history: data.family_history ? JSON.parse(data.family_history) : []
      });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData = {
        ...formData,
        allergies: JSON.stringify(formData.allergies),
        conditions: JSON.stringify(formData.conditions),
        medications: JSON.stringify(formData.medications),
        family_history: JSON.stringify(formData.family_history)
      };
      await apiPutJson('/users/me', updateData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save user data:', error);
      alert('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addListItem = (field: 'allergies' | 'conditions' | 'medications' | 'family_history') => {
    const value = window.prompt(`添加${getLabel(field)}项目:`);
    if (value && value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeListItem = (field: 'allergies' | 'conditions' | 'medications' | 'family_history', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getLabel = (field: string) => {
    switch(field) {
      case 'allergies': return '过敏史';
      case 'conditions': return '既往病史';
      case 'medications': return '长期用药';
      case 'family_history': return '家族病史';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-semibold text-slate-800">个人信息</h1>
        <div className="flex gap-2">
          {isEditing ? (
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-teal-600 text-white rounded-lg px-4 py-1.5 text-sm font-medium flex items-center gap-1 shadow-sm active:scale-95 transition-transform disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              保存
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-teal-600 text-sm font-medium px-2 py-1"
            >
              编辑
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Basic Info Card */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-teal-500" />
            基本情况
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <EditItem 
              label="年龄" 
              value={formData.age} 
              isEditing={isEditing} 
              onChange={(v) => updateField('age', v)} 
            />
            <EditItem 
              label="性别" 
              value={formData.gender} 
              isEditing={isEditing} 
              onChange={(v) => updateField('gender', v)} 
              type="select"
              options={['男', '女', '其他']}
            />
            <EditItem 
              label="血型" 
              value={formData.blood_type} 
              isEditing={isEditing} 
              onChange={(v) => updateField('blood_type', v)} 
              type="select"
              options={['A型', 'B型', 'AB型', 'O型', '其他']}
            />
            <EditItem 
              label="身高" 
              value={formData.height} 
              isEditing={isEditing} 
              onChange={(v) => updateField('height', v)} 
            />
            <EditItem 
              label="体重" 
              value={formData.weight} 
              isEditing={isEditing} 
              onChange={(v) => updateField('weight', v)} 
            />
          </div>
        </section>

        {/* List Sections */}
        <ListSection 
          title="过敏史" 
          icon={<AlertCircle size={18} className="text-orange-500" />}
          items={formData.allergies}
          isEditing={isEditing}
          colorClass="bg-orange-50 text-orange-700 border-orange-100"
          bulletColor="bg-orange-400"
          onAdd={() => addListItem('allergies')}
          onRemove={(idx) => removeListItem('allergies', idx)}
          isTag={true}
        />

        <ListSection 
          title="既往病史" 
          icon={<Activity size={18} className="text-blue-500" />}
          items={formData.conditions}
          isEditing={isEditing}
          bulletColor="bg-blue-400"
          onAdd={() => addListItem('conditions')}
          onRemove={(idx) => removeListItem('conditions', idx)}
        />

        <ListSection 
          title="长期用药" 
          icon={<Pill size={18} className="text-purple-500" />}
          items={formData.medications}
          isEditing={isEditing}
          bulletColor="bg-purple-400"
          onAdd={() => addListItem('medications')}
          onRemove={(idx) => removeListItem('medications', idx)}
        />

        <ListSection 
          title="家族病史" 
          icon={<div className="w-4 h-4 rounded-full border-2 border-teal-500 flex items-center justify-center"><div className="w-2 h-2 bg-teal-500 rounded-full"></div></div>}
          items={formData.family_history}
          isEditing={isEditing}
          bulletColor="bg-teal-400"
          onAdd={() => addListItem('family_history')}
          onRemove={(idx) => removeListItem('family_history', idx)}
        />

        <div className="text-xs text-slate-400 text-center pt-4 pb-8">
          完善个人信息有助于 AI 提供更准确的健康建议
        </div>
      </div>
    </div>
  );
}

function EditItem({ label, value, isEditing, onChange, type = 'text', options = [] }: any) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      {isEditing ? (
        type === 'select' ? (
          <select 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-teal-500"
          >
            <option value="">未选择</option>
            {options.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-teal-500"
          />
        )
      ) : (
        <div className="text-sm font-medium text-slate-700">{value || '未填写'}</div>
      )}
    </div>
  );
}

function ListSection({ title, icon, items, isEditing, onAdd, onRemove, colorClass, bulletColor, isTag }: any) {
  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className={isTag ? "flex flex-wrap gap-2" : "space-y-3"}>
        {items.length === 0 && !isEditing && <p className="text-xs text-slate-400 italic">暂无记录</p>}
        {items.map((item: string, idx: number) => (
          isTag ? (
            <span key={idx} className={`${colorClass} px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1`}>
              {item}
              {isEditing && (
                <button onClick={() => onRemove(idx)} className="ml-1 text-orange-400 hover:text-orange-600">
                  <Trash2 size={12} />
                </button>
              )}
            </span>
          ) : (
            <li key={idx} className="flex items-start justify-between gap-2 group">
              <div className="flex items-start gap-2 text-slate-700 text-sm">
                <div className={`w-1.5 h-1.5 rounded-full ${bulletColor} mt-1.5 flex-shrink-0`}></div>
                {item}
              </div>
              {isEditing && (
                <button onClick={() => onRemove(idx)} className="text-slate-300 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          )
        ))}
        {isEditing && (
          <button 
            onClick={onAdd}
            className="flex items-center gap-1 text-slate-400 border border-dashed border-slate-300 px-3 py-1 rounded-full text-sm hover:text-teal-600 hover:border-teal-300 transition-colors mt-1"
          >
            <Plus size={14} /> 添加
          </button>
        )}
      </div>
    </section>
  );
}
