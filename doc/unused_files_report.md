# 项目无用/可清理文件分析报告

> 首次生成：2026-03-25 | 最后更新：2026-04-07（已执行清理 + 二次复查）

---

## ✅ 已删除文件清单（两轮清理）

### 第一轮（2026-04-07 按旧报告执行）

| 文件 | 类型 |
|---|---|
| `backend/check_confidence.py` | 调试脚本 |
| `backend/check_routes.py` | 调试脚本 |
| `backend/verify_consistency.py` | 调试脚本 |
| `backend/test_dashscope.py` | 调试脚本 |
| `backend/test_analysis.py` | 调试脚本 |
| `backend/test_model_load.py` | 调试脚本 |
| `backend/test_report_flow.py` | 调试脚本 |
| `backend/test_rag_integration.py` | 调试脚本 |
| `backend/get_envs.py` | 工具脚本 |
| `backend/migrate_fix.py` | 一次性迁移脚本 |
| `backend/backend_persistent.log` | 日志 |
| `backend/debug_local_model.log` | 日志 |
| `backend/debug_startup.log` | 日志 |
| `backend/final_debug.log` | 日志 |
| `backend/uvicorn.log` | 日志 |
| `backend/uvicorn_crash.log` | 日志 |
| `backend/uvicorn_direct.log` | 日志 |
| `backend/uvicorn_direct_utf8.log` | 日志 |
| `backend/uvicorn_failure.log` | 日志（20.8 KB） |
| `backend/uvicorn_failure_utf8.log` | 日志 |
| `backend/confidence_check.txt` | 调试输出 |
| `backend/consistency_output.txt` | 调试输出 |
| `backend/test_load_output.txt` | 调试输出 |
| `backend/test_res.txt` | 调试输出 |
| `backend/output.txt` | 调试输出 |
| `backend/token.txt` | 调试输出（2字节） |
| `backend/envs.json` | conda 环境导出 |
| `backend/envs_out.txt` | conda 环境输出 |
| `backend/conda.txt` | conda 依赖列表 |
| `create_backend_structure.py` | 一次性脚手架脚本 |
| `build.py` | 早期独立 RAG 构建脚本 |
| `dist/` | Vite 构建产物目录 |

### 第二轮（2026-04-07 复查新发现）

| 文件 | 原因 |
|---|---|
| `backend/docker-compose.yml` | 空文件（0 字节），无内容 |
| `backend/app/services/image_service.py` | 空文件（0 字节），无任何引用 |
| `backend/app/api/v1/encyclopedia.py` | 空文件（0 字节），未被路由注册 |
| `backend/app/api/v1/health.py` | 空文件（0 字节），未被路由注册 |
| `test_res.txt`（根目录） | 调试输出（API 错误日志） |

---

## 🔍 复查结论：当前项目文件状态

### 项目根目录（健康）

| 文件 | 状态 |
|---|---|
| `.env.example` | ✅ 保留（部署参考） |
| `.gitignore` | ✅ 保留 |
| `index.html` | ✅ 保留（Vite 入口） |
| `metadata.json` | ✅ 保留 |
| `package.json` / `package-lock.json` | ✅ 保留 |
| `README.md` | ✅ 保留 |
| `tsconfig.json` / `vite.config.ts` | ✅ 保留 |
| `x.docx` | ⚠️ 用户判断（142 KB，参考文档） |

### backend/ 根目录（健康）

| 文件 | 状态 |
|---|---|
| `.env` | ✅ 保留（环境配置） |
| `alembic.ini` | ✅ 保留（数据库迁移配置） |
| `dermascan.db` | ✅ 保留（SQLite 数据库） |
| `requirements.txt` | ✅ 保留 |

### 目前无其他可删除文件

- `backend/tests/`：正式测试文件，✅ 保留
- `backend/scripts/`：工具脚本（`build_knowledge_base.py`, `download_models.py`, `init_db.py`），✅ 保留
- `backend/alembic/`：数据库迁移历史，✅ 保留
- `backend/app/`：全部为有效业务代码，✅ 保留
- `src/`：前端所有文件均有效，✅ 保留

---

## 汇总

- **第一轮删除**：32 个文件/目录
- **第二轮删除**：5 个空文件
- **共计清理**：约 37 个文件
- **待用户决定**：`x.docx`（142 KB，是否保留参考资料）
