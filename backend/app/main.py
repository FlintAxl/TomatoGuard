from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from app.ml_service import predict_image
from app.recommendations import get_recommendation
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="TomatoGuard API")

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload folder exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Serve uploaded files (original + heatmap + scanned)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.post("/predict/")
async def predict(type_: str = Form(...), files: list[UploadFile] = File(...)):
    results = []

    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Run prediction + get Grad-CAM heatmap + precise scanned region
        disease, confidence, heatmap_path, scanned_path = predict_image(file_path, type_)
        recommendation = get_recommendation(disease)

        results.append({
            "filename": file.filename,
            "disease": disease,
            "confidence": confidence,
            "recommendation": recommendation,
            "original_image": file.filename,
            "heatmap_image": os.path.basename(heatmap_path),
            "scanned_image": os.path.basename(scanned_path)
        })

        # Optionally delete uploaded file if you want to save space
        # os.remove(file_path)  # Comment this line if you want to keep originals

    return {"results": results}
