import os
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np

# Load models
leaf_model = load_model("../ml/models/leaf_model.h5")
fruit_model = load_model("../ml/models/fruit_model.h5")

# Class indices
leaf_classes = {0: "bacterial_spot", 1: "early_blight", 2: "healthy", 3: "late_blight", 4: "leaf_mold", 5: "septoria_leaf_spot"}
fruit_classes = {0: "anthracnose", 1: "blossom_end_rot", 2: "healthy", 3: "buckeye_rot", 4: "gray_mold"}

# Confidence threshold
CONF_THRESHOLD = 0.6  # 60%

# Prediction function
def predict_image(img_path, type_):
    img = image.load_img(img_path, target_size=(224,224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0

    if type_ == "leaf":
        preds = leaf_model.predict(img_array)
        class_index = np.argmax(preds, axis=1)[0]
        confidence = preds[0][class_index]
        disease = leaf_classes[class_index]
    else:  # fruit
        preds = fruit_model.predict(img_array)
        class_index = np.argmax(preds, axis=1)[0]
        confidence = preds[0][class_index]
        disease = fruit_classes[class_index]

    # Apply confidence threshold
    if disease != "healthy" and confidence < CONF_THRESHOLD:
        disease = "healthy / uncertain"

    return disease, float(confidence)
