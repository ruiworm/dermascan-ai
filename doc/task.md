# AI Chat Assistant Integration Progress

- [x] Create basic `AIChatAssistant` component to fix build errors
- [x] Implement UI for the chat assistant (floating button + chat window)
- [x] Connect with backend Qwen service API for chat
- [x] Debug DashScope `url error` issue, identified as invalid model name (`qwen3.5-plus`) and API key free-tier quota exhaustion (`AllocationQuota.FreeTierOnly`)
- [x] Adjust chat assistant UI positioning to stay within the centered container (using `absolute` instead of `fixed`)

- [x] Fix `PaginatedResponse` typing error (`Generic[T]` usage)
- [x] Remove completely `MinIO` dependency and use local filesystem for storage
- [x] Change backend running port from 8000 to 8001 to resolve port conflicts
- [x] Identify local network IP address (`172.20.10.4`) for mobile device/PWA connection and testing
- [x] Switch AI backend from OpenRouter to Alibaba Cloud Bailian (DashScope)
    - [x] Create implementation plan
    - [x] Update `config.py` (Completely removed OpenRouter settings)
    - [x] Update `qwen_service.py` to use DashScope API
    - [x] Update `.env` (Corrected model name to `qwen-plus`)
    - [x] Verify: Complete removal of OpenRouter from code
- [x] Frontend UI cleanup: Remove ABCDE details but keep Assistant button
- [x] Personal Information module upgrade
    - [x] Backend model and API implementation (PUT /me)
    - [x] Frontend UI renaming and editable functionality
    - [x] Database migration (added age, gender, etc. fields)
- [x] Health advice display consistency fix
    - [x] Identification of data mapping discrepancy in History page
    - [x] Unified health advice formatting across generation and history view
- [x] Medical report enhancement
    - [x] Integrated patient "Basic Situation" (age, gender, etc.) into reports
    - [x] Upgraded "Export Report" from browser print to direct PDF download

- [x] Fix history deletion feedback bug (Backend ResponseBase missing success field)
