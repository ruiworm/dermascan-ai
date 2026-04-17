# 基于视觉大模型与检索增强生成的皮肤病变智能分析系统的设计与实现

## 摘要

随着人工智能技术在医疗领域的快速发展，皮肤病变的自动化识别与智能诊断已成为计算机视觉与自然语言处理交叉研究的重要方向。然而，现有皮肤分析系统普遍存在模型泛化能力不足、生成内容缺乏医学依据、用户体验欠佳等问题。针对上述挑战，本文设计并实现了一款基于视觉大模型与检索增强生成技术的皮肤病变智能分析系统——"肤理通"。

本系统采用前后端分离架构，前端基于React 18与TypeScript构建响应式用户界面，支持PWA离线缓存与移动端原生体验；后端采用FastAPI异步框架提供高性能RESTful API服务。在AI引擎层面，系统集成DermFM-Zero皮肤病变视觉基础模型，利用其零样本学习能力实现对128种常见皮肤病变的精准分类；同时引入检索增强生成（RAG）技术，通过FAISS向量数据库与SentenceTransformers嵌入模型构建医学知识库检索管道，有效缓解大语言模型生成内容的"幻觉"问题；最终结合阿里云通义千问（Qwen）大语言模型，生成结构化的个性化健康分析报告。

系统实现了用户认证、皮肤图像分析、AI报告生成、医疗知识库检索、AI问诊助手、个人健康档案管理等核心功能模块。测试结果表明，系统能够稳定完成图像上传、病变识别、知识检索与报告生成的完整业务流程，为用户提供专业、可靠的皮肤健康初步筛查服务。本系统的设计与实现为AI辅助皮肤病诊断提供了可行的技术方案，具有一定的理论价值与应用前景。

**关键词**：皮肤病变识别；视觉大模型；检索增强生成；大语言模型；FastAPI；React

## Abstract

With the rapid development of artificial intelligence technology in the medical field, automated recognition and intelligent diagnosis of skin lesions have become an important direction in the intersection of computer vision and natural language processing. However, existing skin analysis systems generally suffer from insufficient model generalization capabilities, lack of medical basis in generated content, and suboptimal user experience. To address these challenges, this paper designs and implements an intelligent skin lesion analysis system based on vision foundation models and Retrieval-Augmented Generation (RAG) technology, named "DermaScan AI".

The system adopts a front-end and back-end separated architecture. The front-end is built on React 18 and TypeScript to construct a responsive user interface, supporting PWA offline caching and mobile native experience. The back-end uses the FastAPI asynchronous framework to provide high-performance RESTful API services. At the AI engine level, the system integrates the DermFM-Zero skin lesion vision foundation model, leveraging its zero-shot learning capability to achieve precise classification of 128 common skin lesions. Meanwhile, Retrieval-Augmented Generation (RAG) technology is introduced, building a medical knowledge base retrieval pipeline through FAISS vector database and SentenceTransformers embedding model, effectively mitigating the "hallucination" problem of large language model generated content. Finally, combined with Alibaba Cloud's Tongyi Qianwen (Qwen) large language model, structured personalized health analysis reports are generated.

The system implements core functional modules including user authentication, skin image analysis, AI report generation, medical knowledge base retrieval, AI consultation assistant, and personal health profile management. Test results show that the system can stably complete the complete business process of image upload, lesion recognition, knowledge retrieval, and report generation, providing users with professional and reliable preliminary screening services for skin health. The design and implementation of this system provides a feasible technical solution for AI-assisted dermatological diagnosis, with certain theoretical value and application prospects.

**Keywords**: Skin Lesion Recognition; Vision Foundation Model; Retrieval-Augmented Generation; Large Language Model; FastAPI; React

---

# 1 绪论

## 1.1 研究背景

皮肤是人体最大的器官，承担着保护机体免受外界侵害的重要功能。然而，皮肤病已成为全球范围内最常见的疾病类型之一。据世界卫生组织（WHO）统计，全球约三分之一的成年人受到不同程度的皮肤病困扰，从常见的痤疮、湿疹到恶性黑色素瘤等严重病变，皮肤病不仅影响患者的生活质量，某些恶性病变若未能及时发现和治疗，甚至可能危及生命。

传统的皮肤病诊断高度依赖专业皮肤科医生的临床经验，医生通过肉眼观察病变区域的形态、颜色、边界等特征进行判断。然而，专业皮肤科医生资源在全球范围内分布不均，尤其在基层医疗机构和偏远地区，患者往往难以获得及时、专业的诊断服务。此外，人工诊断存在主观性强、效率低、易疲劳等问题，难以满足日益增长的皮肤健康需求。

近年来，深度学习技术在医学影像分析领域取得了突破性进展。卷积神经网络（CNN）、视觉Transformer（ViT）等模型在皮肤图像分类、病灶分割等任务上展现出接近甚至超越专业医生的准确率。特别是基础模型（Foundation Model）范式的兴起，使得模型能够在大规模数据上进行预训练，获得强大的泛化能力和零样本（Zero-shot）推理能力，为皮肤病变的智能化分析提供了新的技术路径。

与此同时，大语言模型（LLM）的快速发展为医疗文本生成带来了革命性变化。然而，直接使用大语言模型生成医疗建议存在严重的"幻觉"问题，即模型可能生成看似合理但缺乏医学依据的内容。检索增强生成（Retrieval-Augmented Generation, RAG）技术的出现，通过在生成过程中引入外部知识库检索，有效提升了生成内容的准确性和专业性，为构建可信的AI医疗助手提供了可行方案。

在此背景下，本文设计并实现了一款基于视觉大模型与检索增强生成技术的皮肤病变智能分析系统，旨在为用户提供便捷、专业的皮肤健康初步筛查服务，缓解医疗资源分布不均的问题。

## 1.2 研究意义

本研究的理论意义主要体现在以下几个方面：

首先，探索了视觉大模型在皮肤病变识别领域的应用范式。DermFM-Zero模型基于CLIP架构进行皮肤病学领域的适配训练，通过零样本学习实现了对128种常见皮肤病变的分类识别，验证了基础模型在垂直医疗领域的迁移学习能力。

其次，研究了检索增强生成技术在医疗文本生成中的应用机制。通过构建FAISS向量索引的医学知识库，结合SentenceTransformers嵌入模型实现语义级知识检索，有效缓解了大语言模型在医疗领域的"幻觉"问题，提升了生成内容的医学专业性和可信度。

本研究的实践意义主要体现在：

第一，为基层医疗机构和偏远地区患者提供了便捷的皮肤健康筛查工具。用户仅需通过手机拍摄病变区域照片，即可在数秒内获得初步识别结果和专业护理建议，降低了就医门槛。

第二，构建了完整的AI辅助皮肤健康分析系统，涵盖图像采集、病变识别、知识检索、报告生成、个人档案管理等全流程功能，为同类医疗AI系统的开发提供了可参考的技术方案。

第三，系统采用轻量化部署方案（SQLite数据库、本地文件系统存储），降低了部署门槛和运维成本，有利于在基层医疗机构推广使用。

## 1.3 国内外研究现状

### 1.3.1 国外研究现状

在皮肤病变智能识别领域，国际研究起步较早且成果丰硕。2017年，Esteva等人在《Nature》上发表的研究首次证明了深度神经网络在皮肤癌分类任务上可达到与专业皮肤科医生相当的水平，引发了学术界对AI辅助皮肤诊断的广泛关注。此后，ISIC（International Skin Imaging Collaboration）等国际组织持续举办皮肤图像分析挑战赛，推动了该领域的技术进步。

在基础模型方面，OpenAI提出的CLIP（Contrastive Language-Image Pre-training）模型开创了视觉-语言预训练的新范式。DermFM-Zero等皮肤病学专用视觉模型正是在此基础上，通过在大规模皮肤图像-文本对上进行领域适配训练，获得了对多种皮肤病变的零样本识别能力。

在医疗文本生成方面，斯坦福大学提出的ClinicalBERT、Google的Med-PaLM等模型专门针对医疗领域进行了优化。RAG技术方面，Facebook AI Research提出的检索增强生成框架已被广泛应用于医疗问答、病历生成等场景，有效提升了生成内容的准确性和可追溯性。

### 1.3.2 国内研究现状

国内在皮肤病变智能分析领域的研究近年来发展迅速。中国科学院、清华大学、浙江大学等高校和研究机构在皮肤图像分类、病灶分割、多模态融合等方面取得了显著成果。阿里达摩院、腾讯AI Lab等企业也推出了各自的医疗AI解决方案。

在大语言模型方面，阿里巴巴的通义千问（Qwen）、百度的文心一言、智谱AI的ChatGLM等国产大模型相继发布，并在医疗领域进行了专门优化。阿里云百炼平台提供了便捷的模型调用接口，降低了AI应用的开发门槛。

然而，国内现有皮肤分析系统仍存在以下不足：一是多数系统依赖特定病种的微调模型，泛化能力有限；二是生成内容缺乏专业知识库支撑，存在"幻觉"风险；三是系统功能单一，缺乏完整的用户健康档案管理。本系统针对上述不足，集成了视觉大模型零样本识别、RAG知识检索增强、个性化报告生成等核心技术，构建了功能完整的皮肤健康智能分析平台。

---

# 2 系统相关技术

## 2.1 React 前端框架

React是由Facebook开发并维护的开源JavaScript库，用于构建用户界面。本系统采用React 18版本作为前端核心框架，主要基于以下考虑：

首先，React的组件化架构使得UI开发更加模块化和可维护。系统将用户界面拆分为独立的可复用组件，如布局组件（Layout）、认证组件（Login/Register）、分析组件（NewAnalysis/AnalysisResult）等，每个组件拥有独立的状态管理和渲染逻辑，便于团队协作和后期维护。

其次，React的虚拟DOM（Virtual DOM）机制有效提升了渲染性能。在皮肤图像上传、AI分析结果展示等需要频繁更新UI的场景中，虚拟DOM通过差异比较（Diffing）算法最小化实际DOM操作，确保流畅的用户体验。

本系统前端技术栈还包括：TypeScript提供静态类型检查，减少运行时错误；Vite作为构建工具，利用ES模块实现毫秒级热更新（HMR），大幅提升开发效率；TailwindCSS提供原子化CSS类，实现响应式布局与移动端优先设计；Framer Motion库为界面添加流畅的动画效果；React Router v7实现客户端路由管理；PWA（Progressive Web App）技术通过vite-plugin-pwa插件实现离线缓存和桌面安装能力，使用户获得接近原生App的体验。

## 2.2 FastAPI 后端框架

FastAPI是一个现代、高性能的Python Web框架，用于构建API服务。本系统选择FastAPI作为后端框架，主要基于以下优势：

首先，FastAPI基于Starlette和Pydantic构建，原生支持异步编程（async/await）。在AI模型推理、知识库检索等耗时操作中，异步机制允许服务器在等待I/O操作完成时处理其他请求，显著提升了系统的并发处理能力。

其次，FastAPI自动生成交互式API文档（Swagger UI和ReDoc），基于OpenAPI标准，便于前后端联调和接口测试。系统启动后，开发者可直接访问/docs端点查看完整的API定义、请求参数和响应格式。

第三，FastAPI与Pydantic的深度集成提供了强大的数据验证能力。通过定义Pydantic模型（如UserCreate、AnalysisCreate等），系统自动完成请求数据的类型检查、格式验证和错误提示，减少了大量手动校验代码。

本系统后端还集成了SQLAlchemy 2.x作为ORM框架，实现Python对象与SQLite数据库的映射；Alembic作为数据库迁移工具，管理数据表结构的版本演进；python-jose库实现JWT（JSON Web Token）的生成与验证，保障用户认证安全；passlib与bcrypt库用于密码的哈希加密存储。

## 2.3 DermFM-Zero 皮肤病变视觉模型

DermFM-Zero是一款专为皮肤病学领域设计的视觉基础模型，基于OpenCLIP架构进行领域适配训练。该模型的核心特点包括：

首先，DermFM-Zero采用ViT-B-16（Vision Transformer Base with 16×16 patches）作为视觉骨干网络。Transformer架构通过自注意力机制（Self-Attention）捕获图像的全局上下文信息，相比传统CNN在长距离依赖建模方面具有显著优势。模型将输入图像分割为16×16像素的图像块（Patch），每个图像块通过线性投影转换为特征向量，再输入Transformer编码器进行特征提取。

其次，DermFM-Zero利用对比语言-图像预训练（CLIP）范式，在大规模皮肤图像-文本对上进行训练。训练过程中，模型学习将图像特征与对应的文本描述映射到同一嵌入空间，使得语义相关的图像和文本在嵌入空间中距离更近。这种训练方式使模型获得了强大的零样本（Zero-shot）推理能力，即无需针对特定任务进行微调，即可对未见过的皮肤病变类型进行分类。

本系统中，DermFM-Zero模型被用于对用户上传的皮肤图像进行病变识别。系统预计算了128种常见皮肤病变（SD-128）的文本特征向量，包括基底细胞癌、恶性黑色素瘤、寻常痤疮、脂溢性角化病等。推理时，模型提取输入图像的特征向量，并与预计算的文本特征向量计算余弦相似度，输出各病变类型的概率分布。系统同时提供中英文病名映射，便于用户理解分析结果。

模型加载过程中，系统采用单例模式（Singleton Pattern）确保全局仅加载一次模型实例，避免重复加载导致的内存浪费。模型推理在独立线程中执行，通过anyio库的to_thread.run_sync方法实现异步调用，防止阻塞主事件循环。

## 2.4 RAG 检索增强生成技术

检索增强生成（Retrieval-Augmented Generation, RAG）是一种将外部知识检索与大语言模型生成相结合的技术框架，旨在解决大模型生成内容的"幻觉"问题和知识时效性问题。

本系统的RAG架构包含以下核心组件：

首先是嵌入模型（Embedding Model）。系统采用shibing624/text2vec-base-chinese作为文本嵌入模型，该模型基于BERT架构，针对中文语义进行了优化训练。嵌入模型将文本片段转换为高维向量表示，使得语义相似的文本在向量空间中距离更近。系统支持本地模型路径加载，提升加载速度并减少网络依赖。

其次是向量数据库（Vector Database）。系统采用FAISS（Facebook AI Similarity Search）作为向量索引引擎。FAISS是由Facebook AI Research开发的高效相似性搜索库，支持大规模向量数据的快速检索。系统在初始化阶段将医学知识库中的所有文本片段编码为向量，构建FAISS索引文件（faiss.index）和元数据文件（meta.json）。查询时，系统将用户问题编码为查询向量，在FAISS索引中执行最近邻搜索，返回相似度最高的K个知识片段。

最后是知识融合生成。系统将检索到的医学知识片段作为上下文（Context）注入到大语言模型的提示词（Prompt）中，引导模型基于检索到的专业知识生成回答。这种方式确保了生成内容有据可查，有效降低了"幻觉"风险。

## 2.5 Qwen 大语言模型

通义千问（Qwen）是由阿里巴巴集团达摩院自主研发的大语言模型系列。本系统采用阿里云百炼平台（DashScope）提供的Qwen-Plus模型API服务，主要基于以下考虑：

首先，Qwen模型在中文理解和生成方面具有显著优势。其训练数据包含大量中文语料，对中文语境下的医学术语、表达习惯有较好的理解能力，能够生成符合中文阅读习惯的健康报告。

其次，阿里云百炼平台提供了兼容OpenAI API格式的接口，本系统通过OpenAI Python SDK即可直接调用，无需额外的适配开发。系统配置了DASHSCOPE_API_KEY、DASHSCOPE_BASE_URL和DASHSCOPE_MODEL等环境变量，实现灵活的模型切换和密钥管理。

在系统架构中，Qwen模型承担两项核心任务：一是健康报告生成，接收DermFM-Zero的图像分析结果、用户问卷反馈和RAG检索的医学知识，生成结构化的JSON格式健康报告，包含症状描述、治疗建议、日常护理和就医警示四个维度；二是AI问诊助手对话，支持多轮交互式对话，为用户提供皮肤健康相关的即时咨询服务。

系统实现了完善的错误处理机制。当API调用失败或配额耗尽时，自动降级为模拟数据模式，确保系统可用性。同时，系统对LLM输出的JSON进行正则表达式清洗和异常解析处理，提高数据解析的鲁棒性。

---

# 3 系统的分析

## 3.1 系统可行性分析

### 3.1.1 社会可行性

皮肤健康问题日益受到公众关注，但专业皮肤科医疗资源分布不均的问题依然突出。据国家卫生健康委员会统计，我国每万人拥有的皮肤科医生数量远低于发达国家水平，基层医疗机构的皮肤病诊断能力尤为薄弱。在此背景下，AI辅助皮肤分析系统具有重要的社会价值。

本系统面向普通用户设计，操作简便，用户仅需通过手机拍摄或上传病变区域照片，即可获得初步识别结果和专业护理建议。系统内置的免责声明明确告知用户分析结果仅供初步筛查参考，不替代专业医疗诊断，引导用户在发现异常时及时就医。这种"AI初筛+专业确诊"的模式既提高了筛查效率，又避免了AI误诊带来的风险，符合医疗AI的伦理规范。

此外，系统支持PWA离线缓存和移动端原生体验，降低了使用门槛，使偏远地区用户也能便捷地获得皮肤健康服务，有助于缩小城乡医疗资源差距，具有良好的社会可行性。

### 3.1.2 技术可行性

本系统的技术可行性体现在以下几个方面：

在技术选型方面，系统采用的各项技术均经过业界广泛验证。React 18、FastAPI、SQLAlchemy等框架拥有活跃的社区支持和完善的文档资料；DermFM-Zero模型基于成熟的OpenCLIP架构，已在皮肤病学领域验证了其零样本分类能力；FAISS向量数据库和SentenceTransformers嵌入模型是RAG技术的标准组件，在多个知识密集型应用中得到了成功应用。

在架构设计方面，系统采用前后端分离架构，前端负责用户交互和数据展示，后端负责业务逻辑和AI推理，两者通过RESTful API进行通信。这种架构使得前后端可以独立开发、部署和扩展，提高了系统的可维护性和可扩展性。

在AI服务集成方面，系统通过本地加载DermFM-Zero模型实现图像分析，通过调用阿里云百炼平台API实现文本生成，兼顾了数据隐私和计算效率。模型推理采用异步线程执行，避免阻塞主事件循环，确保系统的响应性能。

在数据存储方面，系统采用SQLite作为关系型数据库，具有零配置、轻量级、跨平台等优点，适合中小型应用的部署场景。图像文件存储于本地文件系统，通过路径引用实现数据库记录与实际文件的关联。

### 3.1.3 经济可行性

本系统的经济可行性主要体现在低成本部署和运营方面：

首先，系统采用的核心技术组件均为开源软件，无需支付软件许可费用。React、FastAPI、SQLAlchemy、FAISS等框架和库均采用MIT、Apache或BSD等宽松开源协议，可自由使用和修改。

其次，系统采用轻量化部署方案。SQLite数据库无需独立的数据库服务器，与应用程序共享同一台服务器即可运行；图像文件存储于本地文件系统，无需额外的对象存储服务（如AWS S3、阿里云OSS），降低了存储成本。

第三，AI模型调用成本可控。DermFM-Zero模型在本地运行，无需云端GPU资源；Qwen大语言模型通过阿里云百炼平台API调用，按使用量计费，初期用户规模较小时成本较低。系统还实现了模拟数据降级机制，在API配额耗尽时仍可提供基本服务。

综上所述，本系统的开发和部署成本较低，适合个人开发者、小型团队或基层医疗机构使用，具有良好的经济可行性。

### 3.1.4 数据库数据结构分析

本系统采用SQLite作为关系型数据库，通过SQLAlchemy ORM框架进行数据模型定义和管理。数据库包含以下核心数据表：

**用户表（users）**：存储用户基本信息和个人健康数据。包含字段：id（主键）、username（用户名，唯一索引）、email（邮箱，唯一索引）、hashed_password（密码哈希）、is_active（激活状态）、is_superuser（管理员标识）、created_at（创建时间）、age（年龄）、gender（性别）、blood_type（血型）、height（身高）、weight（体重）、allergies（过敏史）、conditions（既往病史）、medications（用药情况）、family_history（家族病史）。用户表与分析记录表通过外键关联，支持级联删除。

**图像表（images）**：存储用户上传的皮肤图像信息。包含字段：id（主键）、user_id（外键关联用户表）、filename（文件名）、file_path（文件路径）、content_type（MIME类型）、file_size（文件大小）、created_at（创建时间）。图像表与分析记录表通过一对一关系关联，设置级联删除。

**分析记录表（analyses）**：存储AI图像分析结果。包含字段：id（主键）、user_id（外键关联用户表）、image_id（外键关联图像表，唯一约束）、disease_type（识别的疾病类型）、confidence（置信度）、features（JSON格式的特征数据，包含概率分布、Top-K预测、ABCD规则分析等）、status（分析状态：pending/processing/completed/failed）、created_at（创建时间）。

**健康建议表（health_advice）**：存储LLM生成的健康报告内容。包含字段：id（主键）、analysis_id（外键关联分析记录表，唯一约束）、symptoms_description（症状描述）、recommended_treatment（推荐治疗）、daily_care（日常护理）、medical_advice（就医建议）、created_at（创建时间）。与分析记录表通过一对一关系关联，设置级联删除。

**知识库表（knowledge_base）**：存储皮肤病学百科文章。包含字段：id（主键）、title（标题）、category（分类：diseases/symptoms/treatments）、content（正文内容）、source（来源）、created_at（创建时间）、updated_at（更新时间）。

数据库通过Alembic进行版本管理，确保数据表结构的可追溯性和可回滚性。初始化迁移脚本（1909e228b4d2_init.py）定义了全部数据表结构，后续可通过生成新的迁移脚本进行结构变更。

## 3.2 系统需求分析

### 3.2.1 功能性需求

本系统需满足以下功能性需求：

**用户认证模块**：支持用户注册、登录和个人信息管理。注册时需验证用户名和邮箱的唯一性，密码需进行哈希加密存储；登录时支持用户名或邮箱两种方式，认证成功后返回JWT Token用于后续请求鉴权；用户可查看和修改个人健康信息，包括年龄、性别、血型、身高、体重、过敏史、既往病史等。

**皮肤图像分析模块**：支持用户通过手机相机拍摄或本地文件上传皮肤图像；系统对上传的图像进行格式验证（仅支持JPEG/PNG格式）和大小限制（最大10MB）；调用DermFM-Zero模型进行病变识别，输出疾病类型、置信度和Top-K预测结果；分析过程采用异步处理，避免用户长时间等待。

**AI健康报告生成模块**：在图像分析完成后，用户可填写问卷反馈（是否有瘙痒或疼痛、病变是否有近期变化、其他部位是否有类似病变）；系统结合分析结果、用户反馈和RAG检索的医学知识，调用Qwen大模型生成结构化健康报告，包含症状描述、推荐治疗、日常护理和就医建议四个维度。

**医疗知识库模块**：提供皮肤病学百科文章的浏览和检索功能；文章按疾病、症状、治疗等分类组织；支持文章详情查看，展示完整的医学知识内容。

**AI问诊助手模块**：提供交互式对话界面，用户可随时就皮肤健康问题进行咨询；系统支持多轮对话，保留对话历史上下文；AI回答基于Qwen大模型生成，并结合系统提示词确保回答的专业性和安全性。

**历史记录与个人档案模块**：自动保存用户的所有分析记录，支持按时间排序查看历史记录；用户可查看每条记录的详细信息，包括原始图像、分析结果和健康报告；支持删除不需要的分析记录。

**后台管理模块**：管理员可通过专属仪表盘查看系统运行状态和数据统计；支持知识库内容的增删改查管理，确保医学知识的准确性和时效性。

### 3.2.2 非功能性需求

**性能需求**：图像上传响应时间不超过2秒；模型推理时间因计算资源而异，系统采用预加载机制减少冷启动延迟；API接口并发处理能力需满足日常使用需求，FastAPI异步架构确保高并发场景下的稳定性。

**安全性需求**：用户密码采用bcrypt算法进行哈希加密存储，防止密码泄露；JWT Token设置7天有效期，过期需重新登录；API接口通过JWT中间件进行身份验证，确保用户只能访问自己的数据；图像文件存储于服务器本地，通过路径引用而非直接暴露文件系统。

**可用性需求**：系统需提供清晰的错误提示和操作引导；AI服务不可用时自动降级为模拟数据模式，确保基本功能可用；前端采用响应式设计，适配不同尺寸的屏幕设备；PWA支持离线缓存，在网络不稳定时仍可查看已加载的内容。

**可维护性需求**：代码采用模块化设计，各功能模块职责清晰；后端遵循RESTful API设计规范，接口定义清晰；前端采用TypeScript静态类型检查，减少运行时错误；数据库通过Alembic进行版本管理，便于结构变更和回滚。

**可扩展性需求**：前后端分离架构支持独立扩展；AI服务采用接口抽象，便于替换或添加新的模型；数据库设计预留扩展字段，支持未来功能迭代。

## 3.3 本章小结

本章从社会、技术、经济三个维度对系统进行了可行性分析，论证了系统建设的合理性。通过数据库数据结构分析，明确了系统的数据模型和表间关系。在需求分析部分，详细定义了系统的功能性需求和非功能性需求，为后续的系统设计和实现提供了明确的指导方向。

---

# 4 系统的设计

## 4.1 系统架构设计

本系统采用三层架构设计，分别为前端展示层、业务处理层和数据处理层，各层之间通过明确的接口进行通信，确保系统的模块化、可维护性和可扩展性。

### 4.1.1 前端展示层

前端展示层基于React 18构建，负责用户交互和数据展示。整体架构如下：

**路由管理**：采用React Router v7进行客户端路由管理，定义了首页、登录页、注册页、分析页、结果页、历史记录页、个人档案页、知识库页、AI助手页、健康日历页、管理员仪表盘页等路由路径。通过ProtectedRoute和ProtectedAdminRoute组件实现路由守卫，确保未登录用户无法访问受保护页面，非管理员用户无法访问管理后台。

**状态管理**：采用React Context API进行全局状态管理。AuthContext组件维护用户认证状态（user、loading、token），提供登录、注册、登出等方法，各组件通过useAuth Hook获取认证状态和用户信息。

**组件体系**：系统构建了丰富的UI组件库。Layout组件提供统一的页面布局，包含顶部导航栏和底部标签栏，适配移动端操作习惯；AIChatAssistant组件实现悬浮式聊天助手界面，支持对话历史展示和实时消息发送；各页面组件（Home、NewAnalysis、AnalysisResult、History等）负责具体的业务逻辑和数据展示。

**样式与动效**：采用TailwindCSS实现响应式样式设计，通过原子化CSS类快速构建界面；Framer Motion库为页面切换、按钮点击、数据加载等场景添加流畅的动画效果，提升用户体验。

**PWA支持**：通过vite-plugin-pwa插件配置Service Worker和Web App Manifest，实现离线缓存、后台同步和桌面安装能力。用户可将应用添加到手机主屏幕，获得接近原生App的使用体验。

### 4.1.2 业务处理层

业务处理层基于FastAPI构建，负责业务逻辑处理和AI服务调用。整体架构如下：

**API路由层**：采用APIRouter进行路由分组，按功能模块划分为用户模块（/api/v1/user）、分析模块（/api/v1/analysis）、历史模块（/api/v1/history）、知识库模块（/api/v1/knowledge）、聊天模块（/api/v1/chat）、管理员模块（/api/v1/admin）。各路由模块独立定义，通过主路由（api_router）统一注册。

**服务层**：封装核心业务逻辑为独立的服务类。DermFMService负责DermFM-Zero模型的加载和图像推理；RAGService负责FAISS向量索引的初始化和知识检索；QwenService负责与阿里云百炼平台的API交互，实现健康报告生成和对话功能；UserService封装用户CRUD操作；StorageService负责文件上传和存储管理。

**中间件层**：CORS中间件处理跨域请求，允许前端开发服务器访问后端API；自定义日志中间件记录每次请求的方法、路径、状态码和耗时，便于问题排查；异常处理中间件统一捕获和处理验证错误和运行时异常，返回标准化的错误响应。

**生命周期管理**：通过FastAPI的lifespan机制实现应用启动和关闭时的资源管理。启动阶段初始化默认管理员用户、预加载AI模型（DermFM-Zero和RAG嵌入模型），减少首次请求的冷启动延迟；关闭阶段记录日志，便于资源清理。

### 4.1.3 数据处理层

数据处理层负责数据持久化和AI模型管理，包含以下组件：

**数据库层**：采用SQLite作为关系型数据库，通过SQLAlchemy ORM框架进行数据模型定义和操作。数据库连接通过SessionLocal工厂函数创建，依赖注入函数get_db确保每次请求使用独立的数据库会话，并在请求结束后自动关闭。

**文件存储层**：采用本地文件系统存储用户上传的图像文件。StorageService服务类处理文件上传，生成唯一文件名（UUID），将文件保存至知识库临时目录（knowledge_base/temp），并在数据库中创建对应的Image记录。

**AI模型层**：DermFM-Zero模型存储于本地模型目录，通过HuggingFace Hub或本地路径加载；RAG嵌入模型同样支持本地路径加载；FAISS向量索引文件和元数据文件存储于知识库目录（knowledge_base/rag）。模型加载采用单例模式，确保全局仅加载一次。

## 4.2 系统功能模块设计

### 4.2.1 用户认证模块

用户认证模块负责用户的注册、登录和身份验证，确保系统数据的安全性和隐私保护。

**注册流程**：用户填写用户名、邮箱和密码提交注册请求；后端验证用户名和邮箱的唯一性，若已存在则返回错误提示；密码通过passlib和bcrypt库进行哈希加密后存储至数据库；注册成功后返回用户信息。

**登录流程**：用户输入用户名（或邮箱）和密码提交登录请求；后端查询用户记录，验证密码哈希是否匹配；验证通过后生成JWT Token，包含用户ID和过期时间信息；返回Token和Token类型（bearer），前端存储Token用于后续请求。

**身份验证**：通过OAuth2PasswordBearer中间件提取请求头中的Bearer Token；使用python-jose库解码Token，验证签名和有效期；从数据库查询对应用户信息，返回当前用户对象；若Token无效或过期，返回401未授权错误。

**权限管理**：用户表中的is_superuser字段标识管理员权限；普通用户仅可访问自己的数据；管理员可访问管理后台，进行知识库管理和系统监控。路由守卫组件ProtectedAdminRoute在前端进行权限检查，非管理员用户自动重定向至首页。

### 4.2.2 皮肤图像分析模块

皮肤图像分析模块是系统的核心功能，负责接收用户上传的皮肤图像并调用AI模型进行病变识别。

**图像上传**：前端通过文件选择器或相机采集获取图像，以multipart/form-data格式上传至后端；后端验证文件类型（仅允许JPEG/PNG）和文件大小（最大10MB）；StorageService生成唯一文件名（UUID），将文件保存至本地存储目录，并在数据库中创建Image记录；返回Image对象，包含ID和文件路径。

**模型推理**：用户提交分析请求，携带Image ID；后端验证Image存在且属于当前用户；检查是否已有分析记录，避免重复分析；创建状态为"processing"的Analysis记录；调用DermFMService.analyze_image方法进行图像推理；模型返回疾病类型、置信度和特征数据（包含概率分布、Top-K预测等）；更新Analysis记录的状态为"completed"，存储分析结果。

**结果展示**：前端获取分析结果后，展示疾病名称（中英文）、置信度百分比和Top-3预测列表；特征数据中的概率分布可用于可视化展示各病变类型的匹配程度。

### 4.2.3 AI 报告生成模块

AI报告生成模块在图像分析完成后，结合用户反馈和医学知识生成个性化的健康报告。

**问卷采集**：用户填写三项问卷问题：是否有瘙痒或疼痛症状、病变是否有近期变化（增大或变色）、其他部位是否有类似病变；前端将问卷答案封装为JSON对象提交至后端。

**知识检索**：系统从分析结果中提取Top-3预测的中文病名，拼接为RAG查询字符串；调用RAGService.query方法，在FAISS向量索引中检索最相关的5条医学知识片段；检索结果包含知识文本、章节分类和相似度评分。

**提示词构建**：QwenService构建包含以下上下文的提示词：分析结果（疾病类型、Top-K预测及置信度）、用户问卷反馈、检索到的医学知识片段；提示词要求模型以严格的JSON格式输出，包含症状描述、推荐治疗、日常护理和就医建议四个字段，值使用HTML标签格式化。

**报告生成**：调用阿里云百炼平台API，传入构建的提示词；解析模型返回的JSON响应，进行正则表达式清洗（修复转义字符等常见问题）；将解析结果存储至HealthAdvice表，关联对应的Analysis记录；返回包含健康建议的完整分析对象。

### 4.2.4 医疗知识库模块

医疗知识库模块提供皮肤病学百科文章的浏览和检索功能。

**文章列表**：后端提供分页查询接口，支持按分类（疾病、症状、治疗）筛选；返回文章列表，包含ID、标题、分类和摘要信息；前端以卡片形式展示文章列表，支持分类标签切换。

**文章详情**：用户点击文章卡片后，后端根据文章ID查询完整内容；返回文章标题、分类、正文和来源信息；前端以富文本形式渲染文章内容，支持HTML标签格式化。

**后台管理**：管理员可通过管理后台进行知识库内容的增删改查操作；新增文章需填写标题、分类、正文和来源；编辑文章可修改现有内容；删除文章需确认操作，防止误删。

### 4.2.5 AI 问诊助手模块

AI问诊助手模块提供交互式对话界面，用户可随时就皮肤健康问题进行咨询。

**对话界面**：前端实现聊天窗口组件，包含消息列表、输入框和发送按钮；消息列表区分用户消息和AI回复，采用不同的样式和布局；支持对话历史的滚动查看。

**对话逻辑**：用户输入消息后，前端将消息内容和历史对话记录发送至后端；后端调用QwenService.chat方法，传入用户消息和对话历史；Qwen模型基于系统提示词（定义为专业友好的AI护肤助手）生成回复；返回AI回复文本，前端追加至消息列表。

**上下文管理**：前端维护对话历史数组，包含角色（user/assistant）和内容字段；每次发送新消息时，将完整的历史记录发送至后端，确保模型理解对话上下文；系统提示词始终位于消息列表首位，定义AI助手的角色和行为规范。

## 4.3 系统业务流程设计

### 4.3.1 用户注册与登录流程

用户打开系统后，若未登录则自动跳转至登录页面。新用户可点击"注册"按钮进入注册页面，填写用户名、邮箱和密码后提交。后端验证用户名和邮箱的唯一性，密码加密存储后返回用户信息。已注册用户输入用户名（或邮箱）和密码后提交登录请求，后端验证密码匹配后生成JWT Token返回。前端将Token存储于localStorage，后续请求自动携带Token进行身份验证。Token有效期为7天，过期后需重新登录。

### 4.3.2 皮肤分析与报告生成流程

用户登录后进入首页，点击"开始分析"按钮进入分析页面。用户可选择拍照或从相册上传皮肤图像，上传成功后图像预览展示在页面中。用户点击"开始分析"按钮提交分析请求，后端调用DermFM-Zero模型进行图像推理，返回疾病类型、置信度和Top-K预测结果。分析完成后，用户可查看初步识别结果，并选择填写问卷反馈。提交问卷后，系统调用RAG知识检索和Qwen大模型生成健康报告，包含症状描述、推荐治疗、日常护理和就医建议。用户可查看完整报告，并支持导出为PDF文件保存。

### 4.3.3 知识库检索流程

用户进入知识库页面后，可浏览皮肤病学百科文章列表。文章按疾病、症状、治疗等分类组织，用户可点击分类标签进行筛选。点击文章卡片后进入文章详情页面，展示完整的医学知识内容。在AI问诊助手中，用户提出的问题会自动触发RAG知识检索，检索到的知识片段作为上下文注入到大模型提示词中，确保AI回答的专业性和准确性。

### 4.3.4 AI 问诊对话流程

用户点击悬浮的AI助手按钮打开聊天窗口。用户输入皮肤健康相关问题后点击发送，前端将消息内容和对话历史发送至后端。后端调用Qwen大模型生成回复，模型基于系统提示词和对话上下文生成专业、友好的回答。AI回复展示在聊天窗口中，用户可继续进行多轮对话。对话历史保留在当前会话中，刷新页面后历史记录清空。

## 4.4 本章小结

本章详细阐述了系统的架构设计、功能模块设计和业务流程设计。系统采用三层架构，前端展示层负责用户交互，业务处理层负责逻辑处理和AI服务调用，数据处理层负责数据持久化和模型管理。各功能模块职责清晰，通过明确的接口进行通信。业务流程设计覆盖了用户注册登录、图像分析报告生成、知识库检索和AI问诊对话等核心场景，为后续的系统实现提供了详细的指导。

---

# 5 系统的实现

## 5.1 项目结构

本项目采用前后端分离的目录结构组织，核心文件结构如下：

```
dermascan-ai/
├── src/                          # 前端源代码
│   ├── main.tsx                  # 应用入口
│   ├── App.tsx                   # 路由配置与根组件
│   ├── context/
│   │   └── AuthContext.tsx       # 用户认证状态管理
│   ├── components/
│   │   ├── Layout.tsx            # 页面布局组件
│   │   └── AIChatAssistant.tsx   # AI聊天助手组件
│   └── pages/
│       ├── Login.tsx             # 登录页面
│       ├── Register.tsx          # 注册页面
│       ├── Home.tsx              # 首页
│       ├── NewAnalysis.tsx       # 新建分析页面
│       ├── AnalysisResult.tsx    # 分析结果页面
│       ├── History.tsx           # 历史记录页面
│       ├── Profile.tsx           # 个人档案页面
│       ├── KnowledgeBase.tsx     # 知识库页面
│       ├── ArticleDetail.tsx     # 文章详情页面
│       ├── MedicalAssistant.tsx  # AI问诊助手页面
│       └── admin/
│           ├── AdminDashboard.tsx      # 管理员仪表盘
│           └── KnowledgeManagement.tsx # 知识库管理
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI应用入口
│   │   ├── config.py             # 配置管理
│   │   ├── api/v1/               # API路由
│   │   │   ├── user.py           # 用户认证路由
│   │   │   ├── analysis.py       # 图像分析路由
│   │   │   ├── history.py        # 历史记录路由
│   │   │   ├── knowledge.py      # 知识库路由
│   │   │   ├── chat.py           # 聊天路由
│   │   │   └── admin.py          # 管理员路由
│   │   ├── models/               # 数据模型
│   │   │   ├── database.py       # 数据库连接
│   │   │   ├── user.py           # 用户模型
│   │   │   ├── analysis.py       # 分析记录模型
│   │   │   └── knowledge.py      # 知识库模型
│   │   ├── schemas/              # Pydantic数据验证
│   │   ├── services/             # 业务服务
│   │   │   ├── dermfm_service.py # DermFM-Zero服务
│   │   │   ├── rag_service.py    # RAG检索服务
│   │   │   ├── qwen_service.py   # Qwen大模型服务
│   │   │   ├── user_service.py   # 用户服务
│   │   │   └── storage_service.py# 存储服务
│   │   ├── core/
│   │   │   ├── deps.py           # 依赖注入
│   │   │   └── exceptions.py     # 异常处理
│   │   └── utils/
│   │       ├── security.py       # 安全工具（JWT、密码哈希）
│   │       └── logger.py         # 日志工具
│   ├── DermFM-Zero/              # 皮肤病变视觉模型源码
│   ├── alembic/                  # 数据库迁移
│   └── requirements.txt          # Python依赖
└── package.json                  # 前端依赖配置
```

## 5.2 用户注册与登录模块

### 5.2.1 用户注册

用户注册功能通过POST /api/v1/user/register接口实现。前端Register.tsx组件收集用户输入的用户名、邮箱和密码，通过axios发送POST请求至后端。

后端user.py路由中的create_user函数处理注册请求。首先调用user_service.get_user_by_email和user_service.get_user_by_username检查用户名和邮箱的唯一性，若已存在则抛出HTTPException返回400错误。验证通过后，调用user_service.create_user创建用户记录。

user_service.py中的create_user函数接收UserCreate对象，使用get_password_hash函数对密码进行bcrypt哈希加密，创建User对象并添加至数据库会话，提交后返回新用户记录。密码哈希确保了即使数据库泄露，攻击者也无法直接获取用户明文密码。

### 5.2.2 用户登录与 JWT 鉴权

用户登录功能通过POST /api/v1/user/login接口实现，采用OAuth2密码模式。前端Login.tsx组件收集用户输入的用户名（或邮箱）和密码，以application/x-www-form-urlencoded格式发送POST请求。

后端login_access_token函数接收OAuth2PasswordRequestForm，首先通过用户名查询用户，若未找到则尝试通过邮箱查询（兼容OAuth2表单的username字段）。查询到用户后，调用verify_password函数比对密码哈希与明文密码。验证通过后，调用create_access_token函数生成JWT Token。

security.py中的create_access_token函数使用python-jose库的jwt.encode方法，将用户ID编码为JWT载荷，设置过期时间（默认7天），使用配置的SECRET_KEY进行HS256算法签名。生成的Token返回给前端，前端存储于localStorage。

后续请求中，前端通过axios拦截器自动在请求头中添加Authorization: Bearer {token}。后端的get_current_user依赖注入函数使用OAuth2PasswordBearer提取Token，调用jwt.decode方法验证签名和有效期，从数据库查询对应用户信息并返回。若Token无效或过期，抛出401未授权错误。

### 5.2.3 用户权限管理

系统通过用户表中的is_superuser字段区分普通用户和管理员。默认情况下，注册用户为普通用户（is_superuser=False）。系统启动时，lifespan函数检查是否存在管理员用户，若不存在则创建默认管理员账户（用户名admin，密码adminpassword）。

前端通过AuthContext获取当前用户的is_superuser属性，ProtectedAdminRoute组件检查该属性，非管理员用户自动重定向至首页。后端admin.py路由中的接口通过get_current_user依赖获取当前用户，可在业务逻辑中检查is_superuser属性进行权限控制。

## 5.3 皮肤图像上传与分析模块

### 5.3.1 图像上传与存储

图像上传功能通过POST /api/v1/analysis/upload接口实现。前端NewAnalysis.tsx组件通过文件选择器或react-webcam采集图像，以multipart/form-data格式上传至后端。

后端upload_image函数首先验证文件类型，仅允许image/jpeg、image/png和image/jpg格式。验证通过后，调用storage_service.save_upload_file方法处理文件存储。

storage_service.py中的save_upload_file方法生成UUID作为唯一文件名，保留原始文件扩展名，将文件保存至知识库临时目录（knowledge_base/temp）。同时在数据库中创建Image记录，存储文件名、文件路径、MIME类型和文件大小等信息，关联当前用户ID。返回Image对象供前端使用。

文件路径存储为相对路径，通过FastAPI的StaticFiles中间件挂载为静态资源，前端可直接通过URL访问上传的图像文件。

### 5.3.2 DermFM-Zero 模型推理

图像分析功能通过POST /api/v1/analysis/analyze接口实现。前端提交AnalysisCreate对象，包含Image ID。

后端analyze_image函数首先验证Image存在且属于当前用户，检查是否已有分析记录避免重复分析。创建状态为"processing"的Analysis记录后，调用dermfm_service.analyze_image方法进行模型推理。

dermfm_service.py中的DermFMService类采用单例模式，确保全局仅加载一次模型。load_model方法通过open_clip.create_model_and_transforms加载ViT-B-16架构的预训练模型，设置模型为评估模式（eval）。加载tokenizer后，预计算128种皮肤病变（SD-128）的文本特征向量，存储为_text_features属性。

analyze_image方法首先加载并预处理输入图像，调用preprocess函数将图像转换为模型所需的张量格式。通过encode_image提取图像特征向量，归一化后与预计算的文本特征向量计算余弦相似度，经softmax得到各病变类型的概率分布。使用torch.topk提取Top-3预测结果，构建包含概率分布、Top-K预测和模型版本的特征字典返回。

模型推理在同步函数中执行，通过anyio.to_thread.run_sync异步调用，避免阻塞FastAPI主事件循环。若模型加载失败，系统自动进入模拟降级模式，返回随机预测结果和模拟特征数据，确保系统可用性。

## 5.4 AI 健康报告生成模块

### 5.4.1 用户问卷采集

健康报告生成前，用户需填写三项问卷问题。前端AnalysisResult.tsx组件展示问卷表单，包含三个布尔型问题：是否有瘙痒或疼痛（has_itching_or_pain）、病变是否有近期变化（has_recent_changes）、其他部位是否有类似病变（has_similar_lesions）。

用户提交问卷后，前端将答案封装为ReportRequest对象发送至POST /api/v1/analysis/{analysis_id}/report接口。后端generate_analysis_report函数接收问卷答案，调用qwen_service.generate_health_advice方法生成健康报告。

### 5.4.2 RAG 知识检索

在生成健康报告前，系统首先进行RAG知识检索。qwen_service.py中的generate_health_advice方法从分析结果的特征数据中提取Top-3预测的中文病名，拼接为RAG查询字符串。

调用rag_service.query方法，传入查询字符串和top_k=5参数。rag_service.py中的RAGService类在初始化阶段加载SentenceTransformers嵌入模型和FAISS向量索引。query方法将查询字符串编码为向量表示，在FAISS索引中执行最近邻搜索，返回相似度最高的5条知识片段。

每条知识片段包含文本内容、章节分类（chapter/section）和相似度评分。检索到的知识片段拼接为上下文字符串，注入到后续的大模型提示词中。若RAG服务未正确初始化或检索失败，系统记录警告日志并继续执行，使用空上下文生成报告。

### 5.4.3 Qwen 大模型提示词工程与报告生成

QwenService的_build_prompt方法构建包含以下内容的提示词：

系统角色定义：将AI定位为资深皮肤科医生AI，告知模型患者已上传皮肤图像并提供了反馈。

分析结果展示：列出Top-K预测的病变类型及置信度，帮助模型理解视觉分析的结果。

患者反馈：展示用户对三项问卷问题的回答，使模型能够结合患者的主观感受进行分析。

医学知识上下文：将RAG检索到的5条医学知识片段格式化后注入提示词，为模型提供专业参考。

任务要求：要求模型分析病变类型与患者反馈的关联性，基于医学知识提供准确的描述和建议，若多种病变类型概率相近则解释其差异，最终以严格的JSON格式输出。

JSON格式要求：定义四个输出字段（symptoms_description、recommended_treatment、daily_care、medical_advice），要求值使用HTML标签格式化，确保前端渲染效果。

构建完成后，调用阿里云百炼平台API发送请求。_parse_json_response方法对返回内容进行解析，首先提取代码块中的JSON字符串，使用正则表达式清洗转义字符问题，最后通过json.loads解析为Python字典。若解析失败，返回默认的模拟建议数据。

生成的健康建议存储至HealthAdvice表，关联对应的Analysis记录。前端获取完整分析对象后，渲染健康报告的四个维度内容。

## 5.5 历史记录与个人档案模块

### 5.5.1 分析记录查询

历史记录功能通过GET /api/v1/history接口实现。后端get_user_history函数查询当前用户的所有Analysis记录，按创建时间倒序排列，支持分页参数（skip/limit）。

通过SQLAlchemy的joinedload预加载关联的Image和HealthAdvice对象，避免N+1查询问题。返回Analysis列表，每条记录包含ID、疾病类型、置信度、分析状态、创建时间、关联图像信息和健康建议内容。

前端History.tsx组件以列表形式展示历史记录，每条记录以卡片形式展示疾病名称、置信度百分比和分析日期。用户点击卡片后跳转至分析结果页面，查看完整的分析报告。用户可删除不需要的分析记录，后端DELETE /api/v1/analysis/{analysis_id}接口通过级联删除同时移除关联的Image和HealthAdvice记录。

### 5.5.2 个人健康信息管理

个人档案管理通过GET /api/v1/user/me和PUT /api/v1/user/me接口实现。用户访问Profile.tsx页面时，前端获取当前用户信息并展示可编辑表单。

用户模型User中定义了个人健康信息字段：age（年龄）、gender（性别）、blood_type（血型）、height（身高）、weight（体重）、allergies（过敏史）、conditions（既往病史）、medications（用药情况）、family_history（家族病史）。这些字段在注册时为空，用户可在个人档案页面中补充完善。

用户修改信息后提交PUT请求，后端update_user_me函数接收UserUpdate对象，更新对应用户的个人信息字段。更新后的用户信息将用于AI报告生成，使健康建议更加个性化和精准。

## 5.6 医疗知识库与 AI 助手模块

### 5.6.1 知识库浏览与文章详情

知识库浏览功能通过GET /api/v1/knowledge接口实现。后端get_knowledge_articles函数支持分页查询和分类筛选，返回KnowledgeBase文章列表。

前端KnowledgeBase.tsx组件以卡片网格形式展示文章列表，顶部提供分类标签切换按钮（全部、疾病、症状、治疗）。用户点击分类标签后，前端发送带category参数的请求，后端筛选对应分类的文章返回。

文章详情功能通过GET /api/v1/knowledge/{article_id}接口实现。后端get_article_by_id函数根据文章ID查询完整内容，返回标题、分类、正文和来源信息。前端ArticleDetail.tsx组件以富文本形式渲染文章内容，支持HTML标签格式化。

### 5.6.2 AI 护肤助手对话

AI护肤助手对话功能通过POST /api/v1/chat/接口实现。前端MedicalAssistant.tsx组件和AIChatAssistant.tsx悬浮组件均提供聊天界面。

后端chat_with_assistant函数接收ChatRequest对象，包含用户消息和可选的对话历史。调用qwen_service.chat方法，构建消息列表：首先插入系统提示词，定义AI助手为专业友好的护肤顾问，要求用中文回答并在涉及严重医学问题时提醒就医；然后追加对话历史消息；最后添加用户当前消息。

调用阿里云百炼平台API生成回复，返回AI回复文本。前端将回复追加至消息列表，用户可继续进行多轮对话。若API调用失败，返回默认的模拟回复，确保聊天功能的基本可用性。

## 5.7 后台管理模块

### 5.7.1 管理员仪表盘

管理员仪表盘通过AdminDashboard.tsx组件实现。页面展示系统运行状态和关键数据统计，包括用户总数、分析记录总数、知识库文章数量等指标。

后端admin.py路由提供管理员专属接口，支持查询系统统计数据。管理员可通过仪表盘了解系统使用情况，监控服务运行状态。

### 5.7.2 知识库内容管理

知识库内容管理通过KnowledgeManagement.tsx组件实现。管理员可在此页面进行知识库文章的增删改查操作。

新增文章时，管理员填写标题、选择分类（疾病/症状/治疗）、输入正文内容和来源信息，提交后后端创建新的KnowledgeBase记录。编辑文章时，管理员可修改现有文章的任意字段。删除文章时需确认操作，防止误删重要内容。

后端admin.py路由中的管理接口通过is_superuser检查确保仅管理员可访问。知识库内容的更新将同步影响RAG检索结果和AI助手的回答质量，管理员需确保内容的准确性和时效性。

## 5.8 本章小结

本章详细阐述了系统各功能模块的具体实现。从项目结构出发，依次介绍了用户注册与登录、皮肤图像上传与分析、AI健康报告生成、历史记录与个人档案、医疗知识库与AI助手、后台管理等模块的实现细节。各模块通过明确的接口进行通信，代码采用模块化设计，便于维护和扩展。

---

# 6 系统的测试

## 6.1 用户注册功能测试

对用户注册功能进行测试，验证以下场景：

**正常注册**：输入唯一的用户名、邮箱和密码，提交注册请求。预期结果：注册成功，返回用户信息，数据库中创建对应的User记录，密码已进行哈希加密。

**用户名重复**：使用已存在的用户名进行注册。预期结果：返回400错误，提示"该用户名已存在"。

**邮箱重复**：使用已存在的邮箱进行注册。预期结果：返回400错误，提示"该邮箱已存在"。

**密码加密验证**：注册成功后，直接查询数据库中的用户记录，验证hashed_password字段为bcrypt哈希值，而非明文密码。预期结果：密码已正确加密。

## 6.2 用户登录功能测试

对用户登录功能进行测试，验证以下场景：

**正常登录（用户名）**：输入正确的用户名和密码。预期结果：登录成功，返回JWT Token和token_type（bearer）。

**正常登录（邮箱）**：输入正确的邮箱和密码。预期结果：登录成功，返回JWT Token。

**密码错误**：输入正确的用户名但错误的密码。预期结果：返回400错误，提示"用户名或密码错误"。

**用户不存在**：输入不存在的用户名。预期结果：返回400错误，提示"用户名或密码错误"。

**Token验证**：使用返回的Token访问受保护的API接口（如GET /api/v1/user/me）。预期结果：成功返回当前用户信息。

**Token过期**：使用已过期的Token访问受保护接口。预期结果：返回401未授权错误。

## 6.3 图像上传与分析功能测试

对图像上传与分析功能进行测试，验证以下场景：

**正常上传**：选择合法的JPEG/PNG图像文件（小于10MB）进行上传。预期结果：上传成功，返回Image对象，包含ID和文件路径，文件已保存至本地存储目录。

**文件类型错误**：上传非图像文件（如PDF、TXT）。预期结果：返回400错误，提示"无效的文件类型"。

**文件过大**：上传超过10MB的图像文件。预期结果：请求被拒绝，返回400或413错误。

**正常分析**：上传图像后提交分析请求。预期结果：分析成功，返回Analysis对象，包含疾病类型、置信度和Top-K预测结果。数据库中创建对应的Analysis记录，状态为"completed"。

**重复分析**：对已分析的图像再次提交分析请求。预期结果：返回已有的分析记录，提示"图像已分析"，不重复执行模型推理。

**模型降级**：在DermFM-Zero模型加载失败的情况下提交分析请求。预期结果：系统进入模拟降级模式，返回随机预测结果，分析流程不中断。

## 6.4 AI 报告生成功能测试

对AI报告生成功能进行测试，验证以下场景：

**正常报告生成**：在分析完成后填写问卷并提交报告生成请求。预期结果：报告生成成功，返回包含HealthAdvice的Analysis对象。数据库中创建对应的HealthAdvice记录，包含症状描述、推荐治疗、日常护理和就医建议四个字段。

**RAG检索验证**：检查报告生成过程中是否调用了RAG知识检索。预期结果：日志中显示RAG查询字符串和检索到的知识片段数量。

**JSON解析验证**：验证LLM返回的JSON是否正确解析。预期结果：四个字段均为非空字符串，内容符合医学逻辑，HTML标签正确格式化。

**API失败降级**：在阿里云百炼平台API不可用的情况下提交报告生成请求。预期结果：系统返回模拟建议数据，报告生成流程不中断。

**未完成分析生成报告**：对状态不为"completed"的分析记录提交报告生成请求。预期结果：返回400错误，提示"无法为未完成的分析生成报告"。

## 6.5 历史记录查询功能测试

对历史记录查询功能进行测试，验证以下场景：

**正常查询**：登录用户访问历史记录页面。预期结果：返回该用户的所有分析记录，按时间倒序排列，每条记录包含疾病类型、置信度、分析日期和关联图像。

**无记录**：新用户首次访问历史记录页面。预期结果：返回空列表，页面展示"暂无分析记录"提示。

**记录删除**：用户删除某条分析记录。预期结果：删除成功，数据库中对应的Analysis、Image和HealthAdvice记录均被级联删除，历史记录列表不再显示该记录。

**权限隔离**：用户A尝试访问用户B的分析记录。预期结果：返回404错误，用户无法查看其他用户的数据。

## 6.6 本章小结

本章对用户注册、用户登录、图像上传与分析、AI报告生成、历史记录查询等核心功能进行了系统测试。测试覆盖了正常场景和异常场景，验证了系统的功能正确性、错误处理能力和降级机制。测试结果表明，系统各功能模块运行稳定，能够满足用户的皮肤健康分析需求。

---

# 7 总结与展望

## 7.1 总结

本文设计并实现了一款基于视觉大模型与检索增强生成技术的皮肤病变智能分析系统。系统采用前后端分离架构，前端基于React 18和TypeScript构建响应式用户界面，支持PWA离线缓存和移动端原生体验；后端采用FastAPI异步框架提供高性能RESTful API服务。

在AI引擎层面，系统集成DermFM-Zero皮肤病变视觉基础模型，利用其零样本学习能力实现对128种常见皮肤病变的分类识别；引入检索增强生成（RAG）技术，通过FAISS向量数据库与SentenceTransformers嵌入模型构建医学知识库检索管道，有效缓解大语言模型生成内容的"幻觉"问题；结合阿里云通义千问（Qwen）大语言模型，生成结构化的个性化健康分析报告。

系统实现了用户认证、皮肤图像分析、AI报告生成、医疗知识库检索、AI问诊助手、个人健康档案管理等核心功能模块。通过系统测试，验证了各功能模块的正确性和稳定性。本系统的设计与实现为AI辅助皮肤病诊断提供了可行的技术方案，具有一定的理论价值与应用前景。

## 7.2 展望

尽管本系统已实现了核心功能，但仍存在以下改进空间：

**模型性能优化**：当前DermFM-Zero模型在CPU环境下推理速度较慢，未来可引入GPU加速或模型量化技术，提升推理效率。同时，可探索模型蒸馏、剪枝等压缩技术，降低模型部署门槛。

**多模态融合**：当前系统仅支持单张图像分析，未来可扩展为多图像联合分析，支持病变区域的时序对比和趋势分析。同时，可引入文本描述输入，实现图像-文本多模态联合推理。

**知识库扩展**：当前RAG知识库规模有限，未来可扩展至更全面的皮肤病学文献和临床指南，提升检索结果的覆盖度和专业性。同时，可引入知识图谱技术，实现医学知识的结构化表示和推理。

**个性化推荐**：当前健康报告生成主要基于图像分析结果和问卷反馈，未来可结合用户的个人健康档案、历史分析记录和地理位置等信息，提供更加个性化的健康建议和就医推荐。

**合规与安全**：医疗AI系统需符合相关法规要求，未来需加强数据隐私保护，引入数据脱敏、加密存储等技术。同时，需建立完善的模型评估和验证机制，确保AI分析结果的准确性和可靠性。

**临床验证**：本系统目前主要用于初步筛查参考，未来可与医疗机构合作，开展临床试验验证，收集真实世界数据，评估系统的诊断准确率和临床实用性，为系统的进一步优化提供数据支撑。

---

## 参考文献

[1] Esteva A, Kuprel B, Novoa R A, et al. Dermatologist-level classification of skin cancer with deep neural networks[J]. Nature, 2017, 542(7639): 115-118.

[2] Radford A, Kim J W, Hallacy C, et al. Learning transferable visual models from natural language supervision[C]//International Conference on Machine Learning. PMLR, 2021: 8748-8763.

[3] Lewis P, Perez E, Piktus A, et al. Retrieval-augmented generation for knowledge-intensive NLP tasks[J]. Advances in Neural Information Processing Systems, 2020, 33: 9459-9474.

[4] Dosovitskiy A, Beyer L, Kolesnikov A, et al. An image is worth 16x16 words: Transformers for image recognition at scale[C]//International Conference on Learning Representations. 2021.

[5] Reimers N, Gurevych I. Sentence-BERT: Sentence embeddings using Siamese BERT-networks[C]//Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing. 2019: 3982-3992.

[6] Johnson J, Douze M, Jégou H. Billion-scale similarity search with GPUs[J]. IEEE Transactions on Big Data, 2019, 7(3): 535-547.

[7] Touvron H, Lavril T, Izacard G, et al. LLaMA: Open and efficient foundation language models[J]. arXiv preprint arXiv:2302.13971, 2023.

[8] 阿里云. 通义千问技术报告[R]. 阿里巴巴集团, 2023.

[9] 国家卫生健康委员会. 中国卫生健康统计年鉴[M]. 北京: 中国协和医科大学出版社, 2023.

[10] World Health Organization. Global report on skin diseases[R]. Geneva: WHO, 2022.

[11] Litjens G, Kooi T, Bekkers E J, et al. A survey on deep learning in medical image analysis[J]. Medical Image Analysis, 2017, 42: 60-88.

[12] Brinker T J, Hekler A, Enk A H, et al. Deep neural networks are superior to dermatologists in melanoma image classification[J]. European Journal of Cancer, 2019, 119: 11-17.

[13] Han X, Zhang Z, Ding N, et al. Pre-trained models: Past, present and future[J]. AI Open, 2021, 2: 225-250.

[14] Gao L, Dai Z, Callan J. Precise zero-shot dense retrieval without relevance labels[C]//Proceedings of the 61st Annual Meeting of the Association for Computational Linguistics. 2023: 12436-12453.

[15] 张钊, 刘洋, 孙茂松. 大语言模型幻觉问题研究综述[J]. 计算机学报, 2024, 47(1): 1-25.

---

## 致 谢

在本论文完成之际，谨向所有给予我帮助和支持的人表示诚挚的感谢。

首先，感谢我的指导老师。从选题确定、方案设计到论文撰写，老师始终给予我悉心的指导和耐心的帮助。老师严谨的治学态度、渊博的专业知识和丰富的实践经验使我受益匪浅，在此表示衷心的感谢。

其次，感谢项目合作者和同学们。在系统开发过程中，我们相互讨论、共同进步，解决了一个又一个技术难题。感谢你们在代码审查、功能测试和文档撰写方面提供的宝贵建议。

感谢开源社区的贡献者们。本系统所使用的React、FastAPI、DermFM-Zero、FAISS、SentenceTransformers等开源框架和模型，为系统的开发提供了坚实的技术基础。开源精神是推动技术进步的重要力量。

最后，感谢我的家人。感谢你们在我求学期间的理解、支持和鼓励，使我能够安心完成学业和论文工作。

由于本人水平有限，论文中难免存在不足之处，恳请各位老师和同学批评指正。
