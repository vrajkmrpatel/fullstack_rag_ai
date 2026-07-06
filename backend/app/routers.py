import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from app.schemas import ChatRequest, ChatResponse, SourceChunk, UploadResponse
from app.dependencies import get_pipeline, RAGPipeline

router = APIRouter()

# Updated final prompt containing a placeholder for the chat history
qa_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert research assistant. Answer the user's question using ONLY the provided context.\n\nContext:\n{context}"),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}")
])


@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...), 
    pipeline: RAGPipeline = Depends(get_pipeline)
):
    """
    Accepts a PDF file upload, writes it to a temporary path, 
    and passes it to the RAG pipeline for advanced hierarchical chunking.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    tmp_path = None
    try:
        # Create a secured temporary file for PyPDFLoader to read safely
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        # Ingest documents using ParentDocumentRetriever
        pipeline.ingest_pdf(tmp_path)
        
        return UploadResponse(
            message="Document successfully processed and indexed hierarchically.",
            filename=file.filename
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
        
    finally:
        # Always clean up disk storage from temporary files
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, pipeline: RAGPipeline = Depends(get_pipeline)):
    try:
        # 1. Convert incoming API history list to LangChain message objects
        langchain_history = []
        for msg in request.history:
            if msg.role == "human":
                langchain_history.append(HumanMessage(content=msg.content))
            elif msg.role == "ai":
                langchain_history.append(AIMessage(content=msg.content))

        # 2. Condense the query if history exists
        search_query = pipeline.condense_query(request.query, langchain_history)
        print(f"Original Query: {request.query} -> Condensed Query: {search_query}")

        # 3. Use the condensed query to fetch matching chunks from the PDF
        retrieved_docs = pipeline.advanced_retriever.invoke(search_query)
        
        if not retrieved_docs:
            return ChatResponse(answer="I couldn't find any relevant context to answer your question.", sources=[])
        
        formatted_context = "\n\n---\n\n".join([doc.page_content for doc in retrieved_docs])
        
        # 4. Generate Answer including history so the LLM knows what was said previously
        chain = qa_prompt | pipeline.llm
        ai_msg = chain.invoke({
            "context": formatted_context,
            "chat_history": langchain_history,
            "question": request.query
        })
        
        sources = []
        for doc in retrieved_docs:
            raw_score = doc.metadata.get("relevance_score")
            score = float(raw_score) if raw_score is not None else 0.0
            
            sources.append(
                SourceChunk(
                    content=doc.page_content, 
                    metadata=doc.metadata,
                    score=score
                )
            )
        
        return ChatResponse(answer=ai_msg.content, sources=sources)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))