import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .config import get_settings
from .routes.analysis import router as analysis_router
from .routes.upload import router as upload_router
from .routes.auth import router as auth_router
from app.routes.forum import router as forum_router
from .services.database import connect_to_mongo, close_mongo_connection

load_dotenv()
settings = get_settings()

print("=" * 60)
print("🚀 Starting TomatoGuard Backend...")
print(f"📊 Environment: {os.getenv('ENV', 'development')}")
print("=" * 60)

app = FastAPI(
    title=settings.project_name,
    description=settings.description,
    version=settings.version,
)

# CORS: Explicitly allow ngrok and Expo origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # Allow all origins for development
        "http://localhost:3000",
        "https://localhost:3000",
        "exp://*",
        "https://*.exp.direct",
        "https://*.ngrok-free.dev",
        "https://mvlsm2g-*.exp.direct",
        "https://*.ngrok.io",
        "https://mvlsm2g-anonymous-8081.exp.direct",  # Your specific Expo origin
        "https://dori-unmutational-johnathon.ngrok-free.dev",  # Your ngrok origin
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "TomatoGuard API is running"}

@app.on_event("startup")
async def on_startup() -> None:
    print("🔌 Connecting to MongoDB...")
    try:
        await connect_to_mongo()
        print("✅ MongoDB connected successfully!")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        raise

@app.on_event("shutdown")
async def on_shutdown() -> None:
    print("🔌 Closing MongoDB connection...")
    await close_mongo_connection()
    print("✅ MongoDB connection closed.")

# Include route modules
app.include_router(analysis_router)
app.include_router(upload_router)
app.include_router(auth_router)
app.include_router(forum_router)
if __name__ == "__main__":
    import uvicorn
    print("🌐 Starting server...")
    uvicorn.run(
        "app.main:app",  # run from project root: uvicorn app.main:app --reload
        host="0.0.0.0",
        port=8000,
        reload=True,
    )