import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiGetJson, apiPostJson, apiDelete, apiPutJson } from '../../services/api';
import { 
  Users, Activity, ShieldCheck, LogOut, 
  Trash2, ChevronLeft, BarChart3, Database, BookOpen, Plus, Edit3, X
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analyses' | 'knowledge'>('overview');
  
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Encyclopedia Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await apiGetJson('/admin/stats');
        setStats(res.data);
      } else if (activeTab === 'users') {
        const res = await apiGetJson('/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'analyses') {
        const res = await apiGetJson('/admin/analyses');
        setAnalyses(res.data);
      } else if (activeTab === 'knowledge') {
        const res = await apiGetJson('/knowledge/');
        setKnowledge(res.data);
      }
    } catch (e) {
      console.error(e);
      alert('获取管理数据失败。');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("确定要删除此用户吗？所有相关数据将被永久删除。")) {
      try {
        await apiDelete(`/admin/users/${userId}`);
        fetchData();
      } catch (e: any) {
        alert("删除失败: " + e.message);
      }
    }
  };

  const handleDeleteKnowledge = async (id: number) => {
    if (window.confirm("确定要删除这条百科内容吗？")) {
      try {
        await apiDelete(`/knowledge/${id}`);
        fetchData();
      } catch (e: any) {
        alert("删除失败: " + e.message);
      }
    }
  };

  const openAddModal = () => {
    setEditingArticle(null);
    setTitle('');
    setCategory('');
    setContent('');
    setIsModalOpen(true);
  };

  const openEditModal = (article: any) => {
    setEditingArticle(article);
    setTitle(article.title);
    setCategory(article.category || '');
    setContent(article.content);
    setIsModalOpen(true);
  };

  const handleSaveKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert("标题和内容不能为空");
    setIsModalOpen(false);
    
    try {
      const payload = { title, category, content };
      if (editingArticle) {
        await apiPutJson(`/knowledge/${editingArticle.id}`, payload);
      } else {
        await apiPostJson('/knowledge/', payload);
      }
      fetchData();
    } catch (err: any) {
      alert("保存失败: " + err.message);
    }
  };

  const navigateToHome = () => {
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xl mb-1">
            <ShieldCheck size={28} />
            <h2>DermScan 后台</h2>
          </div>
          <p className="text-xs text-slate-400">系统管理控制台</p>
        </div>
        
        <nav className="flex-1 mt-6">
          <ul className="space-y-2 px-3">
            <li>
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'overview' ? 'bg-teal-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <BarChart3 size={20} />
                数据面板
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'users' ? 'bg-teal-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <Users size={20} />
                用户管理
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('analyses')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'analyses' ? 'bg-teal-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <Database size={20} />
                全域诊断日志
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('knowledge')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'knowledge' ? 'bg-teal-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <BookOpen size={20} />
                百科词条管理
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 space-y-3 border-t border-slate-800">
          <div className="text-sm px-4">
            <p className="text-slate-400">当前账号</p>
            <p className="font-semibold">{user?.username}</p>
          </div>
          <button 
            onClick={navigateToHome}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition"
          >
            <ChevronLeft size={16} /> 返回应用
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition"
          >
            <LogOut size={16} /> 退出登录
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8 relative">
        <h1 className="text-3xl font-bold text-slate-800 mb-8 capitalize">
          {activeTab === 'overview' && '系统概览'}
          {activeTab === 'users' && '用户管理中心'}
          {activeTab === 'analyses' && '全域诊断数据分析'}
          {activeTab === 'knowledge' && '疾病百科知识库管理'}
        </h1>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4">
                    <Users size={24} />
                  </div>
                  <p className="text-slate-500 text-sm">注册用户数</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.totalUsers}</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="w-12 h-12 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center mb-4">
                    <Activity size={24} />
                  </div>
                  <p className="text-slate-500 text-sm">累计执行扫描</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.totalScans}</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center mb-4">
                    <ShieldCheck size={24} />
                  </div>
                  <p className="text-slate-500 text-sm">已完成分析报告</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.completedScans}</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-4">
                    <Activity size={24} />
                  </div>
                  <p className="text-slate-500 text-sm">高危预警 (疑似恶性)</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.highRiskScans}</p>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                      <th className="p-4 font-medium">账户ID</th>
                      <th className="p-4 font-medium">用户名</th>
                      <th className="p-4 font-medium">邮箱</th>
                      <th className="p-4 font-medium">权限组</th>
                      <th className="p-4 font-medium">状态</th>
                      <th className="p-4 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u: any) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 text-slate-500">#{u.id}</td>
                        <td className="p-4 font-medium text-slate-800">{u.username}</td>
                        <td className="p-4 text-slate-600">{u.email}</td>
                        <td className="p-4">
                          {u.is_superuser ? 
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">超级管理员</span> : 
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">普通会员</span>}
                        </td>
                        <td className="p-4">
                          {u.is_active ? 
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">正常</span> : 
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">已封禁</span>}
                        </td>
                        <td className="p-4 text-right">
                          {!u.is_superuser && (
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="永久删除"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && <p className="p-8 text-center text-slate-500">暂无任何用户记录。</p>}
              </div>
            )}

            {/* Analyses Tab */}
            {activeTab === 'analyses' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                      <th className="p-4 font-medium">扫描ID</th>
                      <th className="p-4 font-medium">所属用户</th>
                      <th className="p-4 font-medium">诊断时间</th>
                      <th className="p-4 font-medium">AI分类</th>
                      <th className="p-4 font-medium">置信度</th>
                      <th className="p-4 font-medium">分析状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analyses.map((a: any) => (
                      <tr key={a.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 text-slate-500">#{a.id}</td>
                        <td className="p-4">
                          <p className="font-medium text-slate-800">{a.user.username}</p>
                          <p className="text-xs text-slate-500">{a.user.email}</p>
                        </td>
                        <td className="p-4 text-slate-600">
                          {new Date(a.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4 font-medium text-slate-800 capitalize">
                          {a.diseaseType || '-'}
                        </td>
                        <td className="p-4">
                          {a.confidence ? `${(a.confidence * 100).toFixed(1)}%` : '-'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            a.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {a.status === 'completed' ? '已完成' : '处理中'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                 {analyses.length === 0 && <p className="p-8 text-center text-slate-500">尚无图片分析记录。</p>}
              </div>
            )}

            {/* Knowledge Tab */}
            {activeTab === 'knowledge' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 pb-4">
                  <span className="text-slate-600 font-medium">当前已有百科信息</span>
                  <button onClick={openAddModal} className="flex items-center gap-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition text-sm">
                    <Plus size={16} /> 新增百科内容
                  </button>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                      <th className="p-4 font-medium">ID</th>
                      <th className="p-4 font-medium">疾病标题</th>
                      <th className="p-4 font-medium">疾病类别</th>
                      <th className="p-4 font-medium">最后更新时间</th>
                      <th className="p-4 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {knowledge.map((k: any) => (
                      <tr key={k.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 text-slate-500">#{k.id}</td>
                        <td className="p-4 font-medium text-slate-800">{k.title}</td>
                        <td className="p-4 text-slate-600">
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs border border-blue-100 capitalize">{k.category || '未分类'}</span>
                        </td>
                        <td className="p-4 text-slate-600">
                           {k.updated_at ? new Date(k.updated_at).toLocaleDateString() : new Date(k.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => openEditModal(k)}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition mr-1"
                            title="编辑修改"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteKnowledge(k.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="删除词条"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {knowledge.length === 0 && <p className="p-8 text-center text-slate-500">知识库为空，您可以点击右上角新建内容。</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Encyclopedia Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <BookOpen size={20} className="text-teal-600" />
                {editingArticle ? '编辑百科词条' : '新增首发百科词条'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveKnowledge} className="flex-1 overflow-y-auto p-5 space-y-5">
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">文章标题</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="如：黑色素瘤 (Melanoma)" 
                    className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-teal-500 outline-none"
                    required
                  />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">疾病类别 (可选)</label>
                  <input 
                    type="text" 
                    value={category} 
                    onChange={e => setCategory(e.target.value)} 
                    placeholder="如：恶性肿瘤, 良性色素痣..." 
                    className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex justify-between">
                    <span>百科正文内容 (支持 Markdown)</span>
                  </label>
                  <textarea 
                    value={content} 
                    onChange={e => setContent(e.target.value)} 
                    placeholder="请输入正文..." 
                    className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-teal-500 outline-none h-64 resize-y leading-relaxed"
                    required
                  ></textarea>
               </div>
               <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 mt-2">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
                   取消
                 </button>
                 <button type="submit" className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-lg shadow-teal-500/30">
                   {editingArticle ? '保存修改' : '确认发布'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
