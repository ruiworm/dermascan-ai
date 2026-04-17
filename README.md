# 肤理通 (DermaScan AI) —— 皮肤病变智能分析平台

<div align="center">
  <p><b>基于视觉大模型 (DermFM-Zero) 与检索增强生成 (RAG) 的下一代皮肤健康助手</b></p>
  <p>
    <img src="https://img.shields.io/badge/Frontend-React%2018-blue" alt="React">
    <img src="https://img.shields.io/badge/Backend-FastAPI-green" alt="FastAPI">
    <img src="https://img.shields.io/badge/AI-DermFM--Zero-orange" alt="DermFM">
    <img src="https://img.shields.io/badge/LLM-Qwen-red" alt="Qwen">
    <img src="https://img.shields.io/badge/PWA-Supported-brightgreen" alt="PWA">
  </p>
</div>

---

## 🌟 项目核心亮点

- **智能视觉识别**：集成 **DermFM-Zero** 基础模型，支持零样本（Zero-shot）进行多种复杂皮肤病变识别与分类。
- **RAG 医疗报告引擎**：通过 **检索增强生成** 技术，在 AI 生成建议前检索专业医学百科，解决大模型生成内容的“幻觉”问题，确保专业度。
- **个性化健康档案**：结合用户的年龄、性别、病史等背景，生成定制化的皮肤健康管理报告。
- **极致移动体验**：采用移动优先设计，支持 **PWA (Progressive Web App)** 离线缓存，可一键安装到手机桌面，体验媲美原生 App。

---

## 🛠️ 技术架构

系统采用 **前后端分离架构**，核心逻辑分布如下：

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS (响应式布局、摄像头即时采集)
- **Backend**: Python FastAPI + SQLAlchemy (异步高性能服务、JWT 鉴权)
- **AI Stack**:
  - **Vision**: DermFM-Zero (基于 CLIP 的皮肤影像模型)
  - **Retrieval**: FAISS (向量检索库) + SentenceTransformers
  - **Generation**: Alibaba Cloud DashScope (通义千问 Qwen-Max)
- **Storage**: SQLite + 本地文件系统管理

---

## 🚀 快速启动

### 1. 后端设置 (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows 使用 venv/Scripts/activate
pip install -r requirements.txt
# 配置 .env 文件中的 DASHSCOPE_API_KEY
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. 前端设置 (Vite/React)
```bash
npm install
npm run dev
# 访问 http://localhost:3000
```

---

## 📋 功能预览

1. **AI 皮肤分析**：拍照或上传，秒级获取初步识别结果。
2. **深度健康报告**：包含症状解析、护理建议及标准处理方案（由 AI & RAG 生成）。
3. **健康百科**：集成上千条皮肤病条目的索引检索。
4. **个人档案**：历史记录持久化列表及健康趋势分析。

---

## ⚠️ 免责声明
本平台提供的分析报告**仅供初步筛查参考**，不具备法律效力的诊断证明。如出现皮肤不适或疑似病变，**请务必前往正规三甲医院皮肤科咨询专业医生**。

---

## 📄 论文支持
本项目相关详细实现逻辑请参考 `doc/thesis_final_draft.md`。
