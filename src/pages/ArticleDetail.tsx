import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Clock, Tag, Share2, ThumbsUp, MessageCircle } from 'lucide-react';

export default function ArticleDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const article = location.state?.article || {
    title: '如何区分普通痣和黑色素瘤？',
    category: '科普',
    readTime: '5 min',
    date: '2023-10-25',
    author: '皮肤科专家团队',
    content: `
普通痣和黑色素瘤（一种严重的皮肤癌）在早期可能看起来非常相似，但它们之间存在一些关键的区别。掌握这些区别对于早期发现和治疗至关重要。

### ABCDE 法则

皮肤科医生通常使用 **ABCDE 法则** 来帮助区分普通痣和潜在的黑色素瘤：

1. **A - 不对称性 (Asymmetry)**
   - **普通痣**：通常是圆的或椭圆的，两半看起来是对称的。
   - **黑色素瘤**：形状通常是不规则的，两半不对称。

2. **B - 边界 (Border)**
   - **普通痣**：边缘光滑、清晰。
   - **黑色素瘤**：边缘可能不规则、呈锯齿状或模糊不清。

3. **C - 颜色 (Color)**
   - **普通痣**：通常是均匀的颜色（如棕色、褐色或黑色）。
   - **黑色素瘤**：颜色可能不均匀，包含多种色调（如黑色、褐色、红色、白色甚至蓝色）。

4. **D - 直径 (Diameter)**
   - **普通痣**：通常较小，直径小于 6 毫米（约铅笔橡皮擦大小）。
   - **黑色素瘤**：直径通常大于 6 毫米，但也可能较小。

5. **E - 演变 (Evolving)**
   - **普通痣**：通常保持稳定，大小、形状和颜色不会随时间发生显著变化。
   - **黑色素瘤**：会随时间发生变化，可能变大、变色、发痒或出血。

### 什么时候去看医生？

如果您发现身上的痣有以下任何情况，请立即咨询皮肤科医生：
- 形状、大小或颜色发生变化。
- 出现瘙痒、疼痛或出血。
- 看起来与身上的其他痣明显不同（“丑小鸭”征象）。
- 新出现的痣，特别是如果您已超过 30 岁。

早期发现是治疗黑色素瘤的关键。定期进行皮肤自查，并每年进行一次专业的皮肤检查，是保护皮肤健康的最佳方式。
    `
  };

  return (
    <div className="pb-8 bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-2">
          <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Article Content */}
      <article className="px-5 py-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-800 mb-4 leading-tight">
          {article.title}
        </h1>

        {/* Body */}
        <div 
          className="markdown-body text-slate-600 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>

      {/* Interaction Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-1 text-slate-500 hover:text-teal-600 transition-colors cursor-pointer">
          <ThumbsUp size={20} />
          <span className="text-xs">128</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 hover:text-teal-600 transition-colors cursor-pointer">
          <MessageCircle size={20} />
          <span className="text-xs">24</span>
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-slate-100 rounded-full px-4 py-2 text-xs text-slate-400">
            写下你的想法...
          </div>
        </div>
      </div>
    </div>
  );
}
