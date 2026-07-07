from fastapi import FastAPI
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from app.routers import router
from app.dependencies import get_pipeline
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# Modern FastAPI lifespan manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the models, vectorstore, and retrievers into RAM right when the server starts
    print("Initializing RAG Pipeline...")
    get_pipeline()
    yield
    # Cleanup logic (if any) would go here on shutdown
    print("Shutting down API...")

app = FastAPI(
    title="Document-Based AI Assistant API",
    description="Backend for dynamic PDF RAG with hierarchical chunking",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    # Ensure this matches your frontend URL (e.g., Vite defaults to 5173)
    # allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origins=["https://fullstack-rag-ai.vercel.app/"],  # frontend URL for production deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the routes from routers.py
app.include_router(router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "healthy", "pipeline": "initialized"}