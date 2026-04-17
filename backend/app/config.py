import os
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # 基础配置
    PROJECT_NAME: str = "肤理通"
    API_V1_STR: str = "/api/v1"
    ENV: str = "development"  # development, production, testing
    DEBUG: bool = True

    # 数据库配置 (SQLite)
    DATABASE_URL: str = "sqlite:///./dermascan.db"



    # DashScope (Alibaba Cloud Bailian) API
    DASHSCOPE_API_KEY: str = ""
    DASHSCOPE_MODEL: str = "qwen-plus"
    DASHSCOPE_BASE_URL: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    # HuggingFace (DermFM-Zero) Token
    HF_TOKEN: str = ""

    # JWT配置
    SECRET_KEY: str = "your-super-secret-key-change-it-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # AI模型路径
    DERMFM_MODEL_PATH: str = "./models/dermfm"
    EMBEDDING_MODEL_PATH: str = "./models/embeddings"
    
    # 知识库路径
    KNOWLEDGE_BASE_DIR: str = "./knowledge_base"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

class DevelopmentSettings(Settings):
    DEBUG: bool = True

class ProductionSettings(Settings):
    DEBUG: bool = False

@lru_cache()
def get_settings() -> Settings:
    """
    获取配置单例，支持根据环境变量 ENV 切换开发/生产环境
    """
    env = os.getenv("ENV", "development").lower()
    if env == "production":
        return ProductionSettings()
    return DevelopmentSettings()

# 导出 settings 供其他模块使用
settings = get_settings()
