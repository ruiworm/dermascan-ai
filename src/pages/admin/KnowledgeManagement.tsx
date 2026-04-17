import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Plus, Edit3, Trash2, BookOpen, 
  Search, X, Save, Eye, FileEdit
} from 'lucide-react';
import { apiGetJson, apiPostJson, apiDelete, apiPutJson } from '../../services/api';
import { Knowledge } from '../../types';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

export default function KnowledgeManagement() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Knowledge | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: ''
  });
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await apiGetJson('/knowledge/');
      setArticles(res.data || []);
    } catch (e) {
      console.error(e);
      alert('加载百科数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!id) return;
    
    // Use a clearer confirmation for mobile
    const confirmed = window.confirm('确定要删除这个词条吗？此操作不可撤销。');
    if (!confirmed) return;

    try {
      console.log('Attempting to delete knowledge ID:', id);
      const res = await apiDelete(`/knowledge/${id}`);
      
      if (res) {
        alert('删除成功');
        // Update local state immediately
        setArticles(prev => prev.filter(a => a.id !== id));
      }
    } catch (e: any) {
      console.error('Delete failed:', e);
      alert('删除失败: ' + (e.message || '未知错误'));
    }
  };

  const openEditor = (article?: Knowledge) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        category: article.category || '',
        content: article.content
      });
    } else {
      setEditingArticle(null);
      setFormData({ title: '', category: '', content: '' });
    }
    setIsEditorOpen(true);
    setPreviewMode(false);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      alert('请填写标题和内容');
      return;
    }

    try {
      if (editingArticle) {
        await apiPutJson(`/knowledge/${editingArticle.id}`, formData);
      } else {
        await apiPostJson('/knowledge/', formData);
      }
      setIsEditorOpen(false);
      fetchArticles();
    } catch (e) {
      alert('保存失败');
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white sticky top-0 z-20 px-4 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/profile')} className="p-2 -ml-2 text-slate-600">
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-bold text-lg text-slate-800">百科词条管理</h1>
        </div>
        <button 
          onClick={() => openEditor()}
          className="p-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-100 transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-white border-b border-slate-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索词条或分类..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <div key={article.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
                  {article.category || '未分类'}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditor(article)}
                    className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(article.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{article.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {article.content.replace(/[#*`]/g, '')}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400">
                <span>ID: #{article.id}</span>
                <span>更新于 {new Date(article.updated_at || article.created_at || '').toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} />
            </div>
            <p className="text-slate-500 font-medium">没找到相关词条</p>
            <p className="text-xs text-slate-400 mt-1">您可以点击右上角按钮新增词条</p>
          </div>
        )}
      </div>

      {/* Editor Full-screen Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            {/* Editor Header */}
            <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between">
              <button onClick={() => setIsEditorOpen(false)} className="p-2 -ml-2 text-slate-600">
                <X size={24} />
              </button>
              <h2 className="font-bold text-slate-800">
                {editingArticle ? '编辑词条' : '新增词条'}
              </h2>
              <button 
                onClick={handleSave}
                className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 active:scale-95 transition-transform"
              >
                <Save size={16} /> 保存
              </button>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto flex flex-col">
              {/* Tab Switcher */}
              <div className="flex border-b border-slate-50">
                <button 
                  onClick={() => setPreviewMode(false)}
                  className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${!previewMode ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/30' : 'text-slate-400'}`}
                >
                  <FileEdit size={16} /> 编辑内容
                </button>
                <button 
                  onClick={() => setPreviewMode(true)}
                  className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${previewMode ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/30' : 'text-slate-400'}`}
                >
                  <Eye size={16} /> 预览效果
                </button>
              </div>

              <div className="flex-1 flex flex-col p-4 space-y-4">
                {!previewMode ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">词条标题</label>
                      <input 
                        type="text" 
                        placeholder="输入疾病名称..."
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-lg font-bold text-slate-800 placeholder:text-slate-300 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">所属分类</label>
                      <input 
                        type="text" 
                        placeholder="如：恶性肿瘤..."
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm text-slate-700 placeholder:text-slate-300 outline-none"
                      />
                    </div>
                    <div className="flex-1 flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">详细说明 (MD)</label>
                      <textarea 
                        placeholder="使用 Markdown 编写您的百科内容..."
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        className="flex-1 w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm text-slate-700 placeholder:text-slate-300 outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </>
                ) : (
                  <div className="w-full flex-1 min-w-0 max-w-full overflow-y-auto">
                    <div className="bg-white w-full max-w-full p-2 break-all overflow-wrap-anywhere whitespace-normal text-slate-700 leading-relaxed">
                      <h1 className="text-2xl font-bold text-slate-900 mb-2">{formData.title || '无标题'}</h1>
                      <div className="mb-6">
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                          {formData.category || '未分类'}
                        </span>
                      </div>
                      <div className="markdown-body prose prose-slate max-w-none overflow-x-hidden">
                        <ReactMarkdown>{formData.content || '_暂无内容_'}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
