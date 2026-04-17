import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatWithAI } from '@/services/api';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '您好！我是您的专属 AI 护肤助手。有什么关于皮肤健康或护肤的问题，都可以随时问我哦。' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: inputValue.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Pass previous context to the backend (excluding the initial assistant greeting or just let backend handle it, here we pass relevant history)
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
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "absolute bottom-20 right-4 p-3 bg-teal-600 text-white rounded-full shadow-lg transition-transform hover:scale-105 z-50",
          isOpen && "hidden"
        )}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-4 w-[calc(100%-2rem)] max-w-sm h-[400px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-slate-100 animate-in fade-in slide-in-from-bottom-5">
          <div className="px-4 py-3 bg-teal-600 text-white flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center space-x-2">
              <MessageCircle size={18} />
              <span className="font-medium text-sm">AI 护肤助手</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-teal-700 p-1 rounded-full text-white/80 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "px-4 py-2 text-sm shadow-sm max-w-[85%] break-words whitespace-pre-wrap",
                  msg.role === 'user' 
                    ? "bg-teal-500 text-white rounded-2xl rounded-tr-sm" 
                    : "bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-sm"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 text-slate-700 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm flex items-center space-x-2">
                  <Loader2 size={16} className="animate-spin text-teal-600" />
                  <span className="text-xs text-slate-500">正在思考...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入您的问题..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-4 pr-12 py-2.5 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-1 text-teal-600 hover:text-teal-700 p-2 rounded-full hover:bg-teal-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

