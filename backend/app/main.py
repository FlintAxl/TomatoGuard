import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .config import get_settings
from .routes.analysis import router as analysis_router
from .routes.upload import router as upload_router
from .routes.auth import router as auth_router

load_dotenv()
settings = get_settings()

app = FastAPI(
    title=settings.project_name,
    description=settings.description,
    version=settings.version,
)

# CORS: keep behavior (open for dev/ngrok)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",  # as before
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "TomatoGuard API is running"}

# Include route modules
app.include_router(analysis_router)
app.include_router(upload_router)
app.include_router(auth_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",  # run from project root: uvicorn app.main:app --reload
        host="0.0.0.0",
        port=8000,
        reload=True,
    )