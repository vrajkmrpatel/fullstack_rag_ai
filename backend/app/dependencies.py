import os
import json
import tempfile
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.stores import InMemoryStore
from langchain_classic.storage import LocalFileStore, EncoderBackedStore
# Use ParentDocumentRetriever instead of MultiVectorRetriever
from langchain_classic.retrievers import ParentDocumentRetriever 
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from langchain_classic.retrievers.document_compressors import CrossEncoderReranker
from langchain_classic.retrievers import ContextualCompressionRetriever
from langchain_groq import ChatGroq
from langchain_core.prompts import MessagesPlaceholder
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document

# Added for ingestion and chunking
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

class RAGPipeline:
    def __init__(self):
        print("Loading Embedding Model...")
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
        print("Connecting to Vector DB & DocStore...")
        self.vectorstore = Chroma(
            collection_name="multi_modal_summaries", 
            embedding_function=self.embeddings, 
            persist_directory="./vector_db"
        )
        
        # 2. Replace LocalFileStore with InMemoryStore
        self.store = InMemoryStore()
        
        # 4. Configure the dual-layer splitters from your notebook
        self.parent_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)
        self.child_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)

        # 5. Initialize ParentDocumentRetriever (Replaces MultiVectorRetriever)
        self.dense_retriever = ParentDocumentRetriever(
            vectorstore=self.vectorstore,
            docstore=self.store,
            child_splitter=self.child_splitter,
            parent_splitter=self.parent_splitter,
            search_kwargs={"k": 15}
        )
        
        print("Loading Cross-Encoder Reranker...")
        cross_encoder = HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-base")
        compressor = CrossEncoderReranker(model=cross_encoder, top_n=4)
        
        self.advanced_retriever = ContextualCompressionRetriever(
            base_compressor=compressor,
            base_retriever=self.dense_retriever
        )
        
        # Inside your RAGPipeline class, add this system prompt under __init__:
        self.condense_question_prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are a strict search query generator. Your ONLY task is to rewrite the user's follow-up "
            "question into a standalone question, using context from the chat history. \n\n"
            "RULES:\n"
            "1. You MUST output a question ending with a question mark (?).\n"
            "2. Replace pronouns (it, its, they, this) with the specific nouns they refer to from the history.\n"
            "3. DO NOT answer the question. DO NOT output a declarative statement.\n\n"
            "EXAMPLE:\n"
            "History: [Human: What is YOLO? -> AI: YOLO is an object detection model.]\n"
            "Human: How fast is it?\n"
            "Rewritten Query: How fast is the YOLO object detection model?"
        )),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{question}"),
        ])
        
        print("Loading LLM...")
        # 1. Fast model for final answer generation (Keeps your responses snappy)
        self.llm = ChatGroq(
            model_name="llama-3.1-8b-instant", 
            temperature=0
        )
        
        # 2. Heavy reasoning model for context tracking and condensation
        self.condense_llm = ChatGroq(
            model_name="llama-3.3-70b-versatile", 
            temperature=0
        )

    def ingest_pdf(self, file_path: str):
        """
        Dynamically ingests a PDF by loading it and passing it to the 
        ParentDocumentRetriever, which handles splitting and mapping automatically.
        """
        print(f"Loading and processing PDF: {file_path}")
        loader = PyPDFLoader(file_path)
        docs = loader.load()

        print(f"Ingesting {len(docs)} pages into hierarchical chunks...")
        
        # Batching logic (optional, but good for memory limits if PDFs are large)
        batch_size = 5
        for i in range(0, len(docs), batch_size):
            batch = docs[i : i + batch_size]
            # add_documents automatically splits into parents and children, 
            # links them with UUIDs, and saves them to your Vectorstore and Docstore
            self.dense_retriever.add_documents(batch)
            
        print("Ingestion complete.")
    
     # Add this method to handle query condensation
    def condense_query(self, question: str, chat_history: list) -> str:
        """Rewrites a dependent follow-up question into an independent one based on history."""
        if not chat_history:
            return question
        
        condense_chain = self.condense_question_prompt | self.condense_llm
        result = condense_chain.invoke({
            "chat_history": chat_history,
            "question": question
        })
        
        condensed_text = result.content.strip()
        
        # Guardrail: If the model hallucinates a refusal instead of rewriting, fall back safely
        refusal_keywords = ["no document", "don't have access", "i cannot", "there is no"]
        if any(kw in condensed_text.lower() for kw in refusal_keywords):
            print(f"[Guardrail Triggered] Fallback to original query due to bad condensation.")
            return question

        return condensed_text

# Global instance
pipeline = None

def get_pipeline():
    global pipeline
    if pipeline is None:
        pipeline = RAGPipeline()
    return pipeline