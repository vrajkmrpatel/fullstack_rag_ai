from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# Representing a single message turn
class Message(BaseModel):
    role: str  # "human" or "ai"
    content: str

class ChatRequest(BaseModel):
    query: str
    history: List[Message] = []  # defaults to empty list for new chats

class SourceChunk(BaseModel):
    content: str
    metadata: Dict[str, Any]
    score: Optional[float] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceChunk]

class UploadResponse(BaseModel):
    message: str
    filename: str