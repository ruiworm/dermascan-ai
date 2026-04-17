import json
import logging
from typing import Dict, Any, Optional
from openai import AsyncOpenAI
from app.config import settings
from app.services.rag_service import rag_service

logger = logging.getLogger(__name__)


class QwenService:
    def __init__(self):
        # Using Alibaba Cloud DashScope (Bailian) compatible API
        self.api_key = settings.DASHSCOPE_API_KEY
        self.base_url = settings.DASHSCOPE_BASE_URL
        self.model = settings.DASHSCOPE_MODEL
        
        self.client = AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.base_url,
        )
        logger.info(f"QwenService initialized with DashScope model: {self.model}")

    async def generate_health_advice(
        self,
        disease_type: str,
        features: Optional[Dict[str, Any]] = None,
        user_answers: Optional[Dict[str, bool]] = None
    ) -> Dict[str, str]:
        """
        Call DashScope API to generate structured health advice based on disease type.
        """
        if not self.api_key:
            logger.warning("DASHSCOPE_API_KEY is not set. Returning mock health advice.")
            return self._get_mock_advice(disease_type)

        # 1. Build RAG query from top predictions if available
        rag_query = disease_type
        if features and 'top_predictions' in features:
            top_3 = [p['zh'] for p in features['top_predictions'][:3]]
            rag_query = "，".join(top_3)
            logger.info(f"RAG multi-query: {rag_query}")

        # 2. Retrieve RAG context
        rag_context = ""
        try:
            rag_results = await rag_service.query(rag_query, top_k=5)
            if rag_results:
                rag_context = "\n### Professional Medical Knowledge Base Context:\n"
                for i, res in enumerate(rag_results):
                    rag_context += f"Knowledge {i+1} ({res['chapter']} - {res['section']}): {res['text']}\n"
        except Exception as e:
            logger.error(f"RAG query failed during advice generation: {e}")

        prompt = self._build_prompt(disease_type, features, user_answers, rag_context)

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
            )
            content = response.choices[0].message.content
            return self._parse_json_response(content, disease_type)

        except Exception as e:
            logger.error(f"Failed to generate advice via DashScope: {e}")
            return self._get_mock_advice(disease_type)

    def _build_prompt(
        self,
        disease_type: str,
        features: Optional[Dict[str, Any]],
        user_answers: Optional[Dict[str, bool]] = None,
        context: str = ""
    ) -> str:
        """Construct the prompt including RAG context."""

        candidates_text = ""
        if features and 'top_predictions' in features:
            top_preds = features['top_predictions']
            candidates_text = "\n### Analyzed Potential Conditions (Confidence Scores):\n"
            for i, p in enumerate(top_preds[:5]):
                candidates_text += f"{i+1}. {p['zh']} ({p['en']}): {p['probability']}%\n"
        else:
            candidates_text = f"\n### Primary Suspected Condition: {disease_type}\n"

        answers_text = ""
        if user_answers:
            q1 = 'Yes' if user_answers.get('has_itching_or_pain') else 'No'
            q2 = 'Yes' if user_answers.get('has_recent_changes') else 'No'
            q3 = 'Yes' if user_answers.get('has_similar_lesions') else 'No'
            answers_text = (
                f"\n### Patient Feedback from Inquiry:\n"
                f"- Itching or Pain: {q1}\n"
                f"- Recent changes in lesion (growth/color): {q2}\n"
                f"- Similar lesions elsewhere: {q3}\n"
            )

        prompt = (
            "You are a Senior Dermatologist AI. A patient has uploaded a skin image for analysis and provided feedback.\n"
            "Below is the data from the vision analysis model, the patient questionnaire, and verified medical knowledge.\n"
            "---"
            f"{candidates_text}"
            f"{answers_text}"
            f"{context}\n"
            "---\n"
            "### Task:\n"
            "1. Analyze the correlation between the most likely conditions and the patient's feedback.\n"
            "2. Use the 'Professional Medical Knowledge Base Context' to provide accurate descriptions and care suggestions.\n"
            "3. If multiple conditions have similar probabilities, explain the nuances based on patient feedback.\n"
            "4. Provide detailed health advice in STRICT VALID JSON format.\n\n"
            "### JSON Output Format Requirement:\n"
            "The JSON object must have exactly these keys and the values must be in Chinese.\n"
            "**IMPORTANT**: Use standard HTML tags for the values to ensure perfect formatting. Use `<ul>` and `<li>` for lists, `<p>` for paragraphs, `<strong>` for emphasis, and `<br/>` for line breaks. Ensure each list item is clearly separated.\n\n"
            '{\n'
            '  "symptoms_description": "结合病人反馈，详细描述症状（使用HTML标签）",\n'
            '  "recommended_treatment": "标准的医疗处理建议（使用HTML <ul><li>标签），需标注应由医生诊断",\n'
            '  "daily_care": "详细的日常护理建议（使用HTML <ul><li>标签）",\n'
            '  "medical_advice": "专业的医疗警示与就医信号（使用HTML <ul><li>标签）"\n'
            '}'
        )
        return prompt

    def _parse_json_response(self, content: str, disease_type: str) -> Dict[str, str]:
        """Safely parse the LLM output into a dictionary with error resilience."""
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].strip()
            
            # Resilience: Fix common AI hallucinations like stray backslashes before tags (e.g., \li> instead of <li>)
            import re
            content = re.sub(r'\\([^\/"\\\'bfnrtu])', r'\1', content)
            
            return json.loads(content)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}\nRaw Content: {content}")
            return {
                "symptoms_description": f"Typical symptoms of {disease_type}...",
                "recommended_treatment": "Information unavailable due to parsing error.",
                "daily_care": "Keep the area clean. Avoid sun exposure.",
                "medical_advice": "Please consult a dermatologist."
            }

    def _get_mock_advice(self, disease_type: str) -> Dict[str, str]:
        """Fallback mock data."""
        return {
            "symptoms_description": f"Generative AI mock: Typical symptoms of {disease_type}.",
            "recommended_treatment": f"Standard treatment guidelines for {disease_type}.",
            "daily_care": "Maintain basic skin hygiene, avoid scratching.",
            "medical_advice": "This is an AI generated summary. Please consult a human doctor for a true diagnosis."
        }

    async def chat(self, message: str, history: Optional[list] = None) -> str:
        """Generic chat endpoint using DashScope."""
        if not self.api_key:
            return "这是一个模拟的AI回复：" + message

        messages = []
        if history:
            messages.extend(history)

        # Add system prompt if not already present
        if not messages or messages[0].get('role') != 'system':
            messages.insert(0, {
                'role': 'system',
                'content': '你是一个专业、友好的 AI 护肤助手。你需要用中文回答用户关于皮肤健康、日常护肤、医学护肤等相关的问题。回答应该简洁、准确，并提醒用户在遇到严重医学问题时就医。'
            })

        messages.append({'role': 'user', 'content': message})

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
            )
            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"Failed to generate chat via DashScope: {e}")
            return "抱歉，服务暂时不可用。"


qwen_service = QwenService()
