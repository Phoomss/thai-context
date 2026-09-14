import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.endpoints import router as ai_router

app = FastAPI(
    title="THAI CONTEXT — AI & NLP Service",
    description="Dedicated AI/NLP Service for Thai Context Intelligence Platform (PyThaiNLP, pgvector Semantic Search, RAG, Query Understanding)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-Id"]
)

@app.middleware("http")
async def add_request_id_middleware(request: Request, call_next):
    req_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    response = await call_next(request)
    response.headers["X-Request-Id"] = req_id
    return response

# Exception handler for standardized errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_AI_ERROR",
                "message": str(exc)
            }
        }
    )

# Include Routers
app.include_router(ai_router, prefix="/ai", tags=["AI & NLP"])

@app.get("/health", tags=["Health"])
def root_health():
    return {"status": "ok", "service": settings.APP_NAME}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
