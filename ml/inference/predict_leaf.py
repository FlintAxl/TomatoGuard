import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import os

# Load trained model
model = load_model("../models/leaf_model.h5")

# Map class indices
class_indices = {0: "bacterial_spot", 1: "early_blight", 2: "healthy", 3: "late_blight", 4: "leaf_mold", 5: "septoria_leaf_spot"}

# Confidence threshold
CONF_THRESHOLD = 0.6  # 60%

def predict_leaf(img_path):
    img = image.load_img(img_path, target_size=(224,224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0

    preds = model.predict(img_array)
    class_index = np.argmax(preds, axis=1)[0]
    confidence = preds[0][class_index]
    disease = class_indices[class_index]

    # If confidence too low, mark as "Healthy / Uncertain"
    if disease != "healthy" and confidence < CONF_THRESHOLD:
        disease = "healthy / uncertain"

    return disease, float(confidence)

# Batch prediction helper
def batch_predict(folder_path):
    results = []
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.lower().endswith((".jpg", ".png", ".jpeg")):
                img_path = os.path.join(root, file)
                disease, conf = predict_leaf(img_path)
                results.append((file, disease, conf))
                print(f"{file} → Disease: {disease}, Confidence: {conf:.2f}")
    return results

# Example usage
if __name__ == "__main__":
    test_folder = "../data/processed_split/test/leaf"
    batch_results = batch_predict(test_folder)
