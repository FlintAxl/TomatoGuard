import os
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import tensorflow as tf
import cv2

# Load models
leaf_model = load_model("../ml/models/leaf_model.h5")
fruit_model = load_model("../ml/models/fruit_model.h5")

# Class indices
leaf_classes = {0: "bacterial_spot", 1: "early_blight", 2: "healthy", 3: "late_blight", 4: "leaf_mold", 5: "septoria_leaf_spot"}
fruit_classes = {0: "anthracnose", 1: "blossom_end_rot", 2: "healthy", 3: "buckeye_rot", 4: "gray_mold"}

# Confidence threshold
CONF_THRESHOLD = 0.65  # 65%

# ---------------- Prediction with Grad-CAM + Disease Region ----------------
def predict_image(img_path, type_):
    """Predict disease, confidence, and generate both heatmap and scanned images."""

    # Load image for model
    img = image.load_img(img_path, target_size=(224,224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0

    # Choose model and classes
    if type_ == "leaf":
        model = leaf_model
        classes = leaf_classes
        last_conv_layer = "Conv_1"
    else:
        model = fruit_model
        classes = fruit_classes
        last_conv_layer = "Conv_1"

    # Predict
    preds = model.predict(img_array)
    class_index = np.argmax(preds, axis=1)[0]
    confidence = preds[0][class_index]
    disease = classes[class_index]

    if disease != "healthy" and confidence < CONF_THRESHOLD:
        disease = "healthy / uncertain"

    # Generate Grad-CAM heatmap
    heatmap_path = apply_gradcam(img_path, model, last_conv_layer)

    # Generate precise disease highlight
    scanned_path = highlight_disease_region(img_path)

    return disease, float(confidence), heatmap_path, scanned_path

# ---------------- Grad-CAM Functions ----------------
def make_gradcam_heatmap(img_array, model, last_conv_layer_name):
    grad_model = tf.keras.models.Model(
        [model.inputs],
        [model.get_layer(last_conv_layer_name).output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        class_idx = tf.argmax(predictions[0])
        loss = predictions[:, class_idx]

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    return heatmap.numpy()

def apply_gradcam(img_path, model, last_conv_layer_name):
    img = cv2.imread(img_path)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, (224, 224))
    img_array = np.expand_dims(img_resized, axis=0) / 255.0

    heatmap = make_gradcam_heatmap(img_array, model, last_conv_layer_name)
    heatmap = cv2.resize(heatmap, (img.shape[1], img.shape[0]))
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    superimposed = cv2.addWeighted(img, 0.6, heatmap, 0.4, 0)
    output_path = img_path.replace(".jpg", "_heatmap.jpg")
    cv2.imwrite(output_path, superimposed)
    return output_path

# ---------------- Disease Highlight / Contours ----------------
def highlight_disease_region(img_path, output_suffix="_scanned"):
    """
    Detects diseased areas based on color differences and outlines them.
    Returns the path to the annotated image.
    """
    img = cv2.imread(img_path)
    img_hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # Threshold for darker/brown disease spots
    lower = np.array([0, 50, 20])
    upper = np.array([179, 255, 200])
    mask = cv2.inRange(img_hsv, lower, upper)

    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Draw bounding boxes for contours
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > 100:
            x, y, w, h = cv2.boundingRect(cnt)
            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 0, 255), 2)
            cv2.putText(img, "disease", (x, y - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

    base, ext = os.path.splitext(img_path)
    output_path = f"{base}{output_suffix}{ext}"
    cv2.imwrite(output_path, img)
    return output_path
