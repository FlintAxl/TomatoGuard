from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from app.ml_service import predict_image
from app.recommendations import get_recommendation

app = FastAPI(title="TomatoGuard API")

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/predict/")
async def predict(type_: str = Form(...), files: list[UploadFile] = File(...)):
    results = []

    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        disease, confidence = predict_image(file_path, type_)
        recommendation = get_recommendation(disease)

        results.append({
            "filename": file.filename,
            "disease": disease,
            "confidence": confidence,
            "recommendation": recommendation
        })

        # Delete uploaded file
        os.remove(file_path)

    return {"results": results}
