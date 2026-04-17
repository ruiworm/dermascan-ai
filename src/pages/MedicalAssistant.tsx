import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, Loader2, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { chatWithAI } from '@/services/api';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function MedicalAssistant() {
  const navigate = useNavigate();
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '您好！我是您的专属 AI 护肤小助手。有什么关于皮肤健康、日常护理或健康生活的问题，都可以随时问我哦。' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isChatLoading) return;

    const userMsg: Message = { role: 'user', content: inputValue.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsChatLoading(true);

    try {
      const history = newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithAI(userMsg.content, history);
      
      if (response && response.data) {
        setMessages([...newMessages, { role: 'assistant', content: response.data }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: '抱歉，没有收到有效回复，请重试。' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...newMessages, { role: 'assistant', content: '服务出错了，麻烦稍后再试。' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-4 border-b border-slate-100 shrink-0 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
            <MessageCircle size={18} />
          </div>
          <h1 className="font-semibold text-slate-800">AI 护肤小助手</h1>
        </div>
      </div>

      {/* Main Content Area - Scrollable Chat */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div 
              className={cn(
                "px-4 py-2.5 text-sm shadow-sm max-w-[85%] break-words",
                msg.role === 'user' 
                  ? "bg-teal-600 text-white rounded-2xl rounded-tr-xs" 
                  : "bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-xs"
              )}
              dangerouslySetInnerHTML={{ __html: msg.content }}
            />
          </div>
        ))}
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 text-slate-700 rounded-2xl rounded-tl-xs border border-slate-100 shadow-sm flex items-center space-x-2">
              <Loader2 size={16} className="animate-spin text-teal-600" />
              <span className="text-xs text-slate-500 font-medium">正在思考...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
        <div className="relative flex items-center max-w-2xl mx-auto">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="问问小助手..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-5 pr-14 py-3.5 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400"
            disabled={isChatLoading}
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isChatLoading}
            className="absolute right-1.5 text-teal-600 hover:text-teal-700 p-2.5 rounded-full hover:bg-teal-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-3">
          AI 生成的内容仅供参考，不作为专业医疗诊断建议。
        </p>
      </div>
    </div>
  );
}
