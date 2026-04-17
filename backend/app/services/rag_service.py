import json
import logging
import os
from typing import List, Dict, Any, Optional
import numpy as np
from app.config import settings
import anyio

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(
        self,
        model_name: str = "shibing624/text2vec-base-chinese",
        index_path: Optional[str] = None,
        meta_path: Optional[str] = None
    ):
        self.model_name = model_name
        self.index_path = index_path or os.path.join(settings.KNOWLEDGE_BASE_DIR, "rag", "faiss.index")
        self.meta_path = meta_path or os.path.join(settings.KNOWLEDGE_BASE_DIR, "rag", "meta.json")
        self.model = None
        self.index = None
        self.metadata: List[Dict[str, Any]] = []
        self._initialized = False

    def _initialize(self):
        """Lazy initialization of the embedding model and FAISS index."""
        if self._initialized:
            return

        try:
            import faiss
            from sentence_transformers import SentenceTransformer
            
            # Prefer local model path if it exists
            model_path = settings.EMBEDDING_MODEL_PATH if os.path.exists(settings.EMBEDDING_MODEL_PATH) else self.model_name
            
            logger.info(f"Loading embedding model from: {model_path}")
            self.model = SentenceTransformer(model_path)
            
            if os.path.exists(self.index_path) and os.path.exists(self.meta_path):
                logger.info(f"Loading FAISS index from {self.index_path}")
                self.index = faiss.read_index(self.index_path)
                with open(self.meta_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                logger.info(f"RAG Service initialized with {self.index.ntotal} vectors.")
            else:
                logger.warning(f"RAG index or meta file not found at {self.index_path}")
            
            self._initialized = True
        except Exception as e:
            logger.error(f"Failed to initialize RAG Service: {e}")
            self._initialized = False

    async def query(self, question: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Query the knowledge base for relevant chunks."""
        self._initialize()
        
        if not self.index or not self.model:
            logger.warning("RAG Service not properly initialized. Returning empty results.")
            return []

        try:
            def sync_query():
                # Generate query embedding using sentence-transformers
                q_vec = self.model.encode([question], normalize_embeddings=True)
                q_vec = q_vec.astype(np.float32)

                # Search FAISS index
                scores, indices = self.index.search(q_vec.reshape(1, -1), top_k)
                
                res = []
                for score, idx in zip(scores[0], indices[0]):
                    if idx == -1 or idx >= len(self.metadata):
                        continue
                    res.append({
                        "score": float(score),
                        **self.metadata[idx]
                    })
                return res

            return await anyio.to_thread.run_sync(sync_query)
        except Exception as e:
            logger.error(f"Error during RAG query: {e}")
            return []

rag_service = RAGService()
