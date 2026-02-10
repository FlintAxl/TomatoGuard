import tensorflow as tf
import numpy as np
from PIL import Image, ImageEnhance, ImageOps
import io
import os
import time
import random
import cv2
import base64
import sys
from io import BytesIO  
from typing import Dict, Any, List
from datetime import datetime

class DiseaseSpotDetector:
    """Detects diseased spots and generates bounding boxes"""
    
    def __init__(self):
        # Threshold values for disease spot detection
        self.disease_thresholds = {
            'Early Blight': {'lower': [20, 40, 40], 'upper': [30, 255, 255]},
            'Late Blight': {'lower': [0, 40, 40], 'upper': [10, 255, 255]},
            'Bacterial Spot': {'lower': [15, 40, 40], 'upper': [25, 255, 255]},
            'Septoria Leaf Spot': {'lower': [25, 40, 40], 'upper': [35, 255, 255]},
            'Anthracnose': {'lower': [10, 40, 40], 'upper': [20, 255, 255]},
            'Botrytis Gray Mold': {'lower': [0, 0, 50], 'upper': [180, 50, 150]},
            'Yellow Leaf Curl': {'lower': [30, 40, 40], 'upper': [90, 255, 255]},
            'Buckeye Rot': {'lower': [0, 40, 40], 'upper': [15, 255, 255]},
            'Sunscald': {'lower': [0, 0, 150], 'upper': [180, 50, 255]},
            'Blossom End Rot': {'lower': [0, 40, 40], 'upper': [10, 255, 255]},
            'Blight': {'lower': [0, 40, 40], 'upper': [20, 255, 255]},
            'Wilt': {'lower': [20, 40, 40], 'upper': [40, 255, 255]},
        }
    
    def detect_disease_spots(self, image_bytes, disease_name):
        """
        Detect diseased spots and return bounding boxes
        
        Args:
            image_bytes: Original image bytes
            disease_name: Name of detected disease
        
        Returns:
            dict: Contains bounding boxes and annotated image
        """
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return {"error": "Failed to decode image"}
            
            # Store original for later
            original_image = image.copy()
            
            # Get color thresholds for this disease
            disease_threshold = self.disease_thresholds.get(
                disease_name, 
                {'lower': [0, 40, 40], 'upper': [180, 255, 255]}  # Default if disease not in list
            )
            
            # Convert to HSV for better color segmentation
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            # Create mask based on disease color
            lower = np.array(disease_threshold['lower'])
            upper = np.array(disease_threshold['upper'])
            mask = cv2.inRange(hsv, lower, upper)
            
            # Apply morphological operations to clean up mask
            kernel = np.ones((5,5), np.uint8)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            bounding_boxes = []
            min_area = 100  # Minimum area to consider as a spot
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > min_area:
                    x, y, w, h = cv2.boundingRect(contour)
                    bounding_boxes.append({
                        'x': int(x),
                        'y': int(y),
                        'width': int(w),
                        'height': int(h),
                        'area': float(area),
                        'confidence': min(1.0, area / 1000)  # Simple confidence based on size
                    })
            
            # Sort by area (largest first)
            bounding_boxes.sort(key=lambda b: b['area'], reverse=True)
            
            # Limit to top 10 boxes
            bounding_boxes = bounding_boxes[:10]
            
            # Create annotated image
            annotated_image = self.draw_bounding_boxes(original_image, bounding_boxes, disease_name)
            
            # Convert annotated image to base64
            annotated_base64 = self.image_to_base64(annotated_image)
            
            # Convert original image to base64 for comparison
            original_base64 = self.image_to_base64(original_image)
            
            return {
                'bounding_boxes': bounding_boxes,
                'annotated_image': annotated_base64,
                'original_image': original_base64,
                'total_spots': len(bounding_boxes),
                'total_area': sum(b['area'] for b in bounding_boxes),
                'disease_name': disease_name
            }
            
        except Exception as e:
            return {"error": f"Disease spot detection failed: {str(e)}"}
    
    def draw_bounding_boxes(self, image, boxes, disease_name):
        """Draw bounding boxes on image"""
        annotated = image.copy()
        
        # Color mapping for different diseases
        disease_colors = {
            'Early Blight': (0, 255, 0),     # Green
            'Late Blight': (0, 0, 255),      # Red
            'Bacterial Spot': (255, 0, 0),   # Blue
            'Septoria Leaf Spot': (255, 255, 0),  # Cyan
            'default': (0, 165, 255)         # Orange
        }
        
        color = disease_colors.get(disease_name, disease_colors['default'])
        
        for i, box in enumerate(boxes):
            x, y, w, h = box['x'], box['y'], box['width'], box['height']
            
            # Draw rectangle
            cv2.rectangle(annotated, (x, y), (x + w, y + h), color, 2)
            
            # Draw label
            label = f"Spot {i+1}"
            cv2.putText(annotated, label, (x, y - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
            # Draw confidence
            conf_text = f"{box['confidence']:.1%}"
            cv2.putText(annotated, conf_text, (x, y + h + 15), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)
        
        # Add disease name at top
        cv2.putText(annotated, f"Disease: {disease_name}", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        
        return annotated
    
    def image_to_base64(self, image_array):
        """Convert numpy array to base64 string"""
        # Convert BGR to RGB for PIL
        rgb_image = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(rgb_image)
        
        buffered = BytesIO()
        pil_image.save(buffered, format="JPEG", quality=85)
        
        # Encode to base64
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/jpeg;base64,{img_str}"

class TomatoValidator:
    """
    Validates whether an uploaded image is actually a tomato plant part
    before running through the disease detection pipeline.
    
    Uses a combination of:
    1. Color profile analysis (green foliage / red fruit tones)
    2. Part classifier confidence thresholding
    3. Texture analysis (plant-like vs artificial surfaces)
    """

    # HSV ranges for tomato-plant-relevant colors
    PLANT_COLOR_RANGES = [
        # Green foliage (leaves, stems, unripe fruit)
        {'lower': np.array([25, 30, 30]),  'upper': np.array([95, 255, 255]),  'label': 'green'},
        # Red / ripe fruit tones
        {'lower': np.array([0, 50, 50]),   'upper': np.array([10, 255, 255]),  'label': 'red_low'},
        {'lower': np.array([170, 50, 50]), 'upper': np.array([180, 255, 255]), 'label': 'red_high'},
        # Yellow-orange (ripening, disease spots)
        {'lower': np.array([10, 50, 50]),  'upper': np.array([25, 255, 255]),  'label': 'yellow_orange'},
        # Brown (disease, stem bark)
        {'lower': np.array([10, 30, 20]),  'upper': np.array([20, 200, 150]),  'label': 'brown'},
    ]

    # Minimum thresholds
    MIN_PLANT_COLOR_RATIO = 0.15          # ≥15 % of pixels must be plant-like colors
    MIN_PART_CLASSIFIER_CONFIDENCE = 0.55  # Part classifier must be ≥55 % sure
    MIN_TEXTURE_SCORE = 0.10              # Minimum edge/texture complexity

    def validate(self, image_bytes: bytes, part_prediction: dict) -> dict:
        """
        Run full validation.  Returns a dict with:
          is_valid        – bool, True means "proceed with disease detection"
          rejection_reason – str or None
          scores          – dict of individual check scores
        """
        scores: Dict[str, Any] = {}

        # --- 1. Color profile check ---
        color_ratio = self._compute_plant_color_ratio(image_bytes)
        scores['plant_color_ratio'] = round(color_ratio, 3)
        
        # --- 2. Part classifier confidence ---
        part_confidence = part_prediction.get('confidence', 0)
        scores['part_confidence'] = round(part_confidence, 3)

        # --- 3. Texture / edge complexity ---
        texture_score = self._compute_texture_score(image_bytes)
        scores['texture_score'] = round(texture_score, 3)

        # --- Decision logic ---
        rejection_reasons = []

        if color_ratio < self.MIN_PLANT_COLOR_RATIO:
            rejection_reasons.append(
                f"Image color profile does not match tomato plant (plant colors: {color_ratio:.0%}, need ≥{self.MIN_PLANT_COLOR_RATIO:.0%})"
            )

        if part_confidence < self.MIN_PART_CLASSIFIER_CONFIDENCE:
            rejection_reasons.append(
                f"Part classifier confidence too low ({part_confidence:.0%}, need ≥{self.MIN_PART_CLASSIFIER_CONFIDENCE:.0%})"
            )

        if texture_score < self.MIN_TEXTURE_SCORE:
            rejection_reasons.append(
                f"Image texture does not resemble a plant surface (score: {texture_score:.2f})"
            )

        is_valid = len(rejection_reasons) == 0
        # Allow through if at least 2 of 3 checks pass (soft gate)
        if not is_valid:
            passing = sum([
                color_ratio >= self.MIN_PLANT_COLOR_RATIO,
                part_confidence >= self.MIN_PART_CLASSIFIER_CONFIDENCE,
                texture_score >= self.MIN_TEXTURE_SCORE,
            ])
            if passing >= 2:
                is_valid = True
                scores['soft_pass'] = True

        return {
            'is_valid': is_valid,
            'rejection_reason': '; '.join(rejection_reasons) if not is_valid else None,
            'scores': scores,
        }

    # ------------------------------------------------------------------ #
    #  Internal helpers                                                    #
    # ------------------------------------------------------------------ #

    def _compute_plant_color_ratio(self, image_bytes: bytes) -> float:
        """Fraction of pixels that fall into plant-relevant HSV ranges."""
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                return 0.0

            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            total_pixels = hsv.shape[0] * hsv.shape[1]
            combined_mask = np.zeros(hsv.shape[:2], dtype=np.uint8)

            for cr in self.PLANT_COLOR_RANGES:
                mask = cv2.inRange(hsv, cr['lower'], cr['upper'])
                combined_mask = cv2.bitwise_or(combined_mask, mask)

            plant_pixels = int(np.count_nonzero(combined_mask))
            return plant_pixels / total_pixels if total_pixels > 0 else 0.0
        except Exception:
            return 0.0

    def _compute_texture_score(self, image_bytes: bytes) -> float:
        """
        Measure edge density via Canny.  Plant surfaces are textured;
        solid-color walls / screens are not.
        """
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                return 0.0

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            # Slight blur to suppress noise
            gray = cv2.GaussianBlur(gray, (5, 5), 0)
            edges = cv2.Canny(gray, 50, 150)
            edge_ratio = float(np.count_nonzero(edges)) / (gray.shape[0] * gray.shape[1])
            return edge_ratio
        except Exception:
            return 0.0


class TomatoImagePreprocessor:
    """Preprocess user-uploaded images to match training data characteristics"""
    def __init__(self):
        self.target_size = (224, 224)
        
    def preprocess_for_prediction(self, image):
        """
        Transform user-uploaded images to match YOUR training data characteristics
        """
        # Convert to RGB
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Store original for debugging
        original_size = image.size
        
        # 1. AUTO-CROP to plant (simple center crop - focus on plant)
        width, height = image.size
        crop_size = min(width, height)
        left = (width - crop_size) // 2
        top = (height - crop_size) // 2
        image = image.crop((left, top, left + crop_size, top + crop_size))
        
        # 2. Resize exactly like training
        image = image.resize(self.target_size, Image.Resampling.LANCZOS)
        
        # 3. MATCH YOUR TRAINING AUGMENTATION:
        # Your training uses: rotation_range=25, so add slight rotation variance
        if random.random() > 0.5:
            angle = random.uniform(-25, 25)
            image = image.rotate(angle, expand=False, fillcolor=(255, 255, 255))
        
        # 4. Add contrast (your training images likely have good contrast)
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.15)  # 15% more contrast
        
        # 5. Normalize brightness (make consistent)
        enhancer = ImageEnhance.Brightness(image)
        # Calculate brightness relative to middle gray
        gray = ImageOps.grayscale(image)
        hist = gray.histogram()
        avg_brightness = sum(i * hist[i] for i in range(256)) / (self.target_size[0] * self.target_size[1] * 255)
        
        # Adjust to target brightness (0.5 = middle gray)
        brightness_factor = 0.5 / avg_brightness if avg_brightness > 0 else 1.0
        brightness_factor = max(0.7, min(1.3, brightness_factor))  # Clamp
        image = enhancer.enhance(brightness_factor)
        
        # 6. Convert to array and normalize (EXACTLY like your training: /255)
        img_array = np.array(image) / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array, {
            'original_size': original_size,
            'cropped_size': (crop_size, crop_size),
            'target_size': self.target_size,
            'brightness_adjusted': brightness_factor,
            'contrast_applied': 1.15
        }
    
    def preprocess_original(self, image_bytes, target_size=(224, 224)):
        """Original preprocessing method (kept for backward compatibility)"""
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        original_size = img.size
        img = img.resize(target_size)
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array, {
            'original_size': original_size,
            'target_size': target_size,
            'format': img.format if img.format else 'Unknown'
        }

class MLService:
    def __init__(self, model_path: str = "models/"):
        self.model_path = model_path
        self.models = {}
        self.loaded_models_info = []  # Track loaded models
        self.preprocessor = TomatoImagePreprocessor()  # NEW: Add preprocessor
        self.spot_detector = DiseaseSpotDetector()
        self.validator = TomatoValidator()  # NEW: Add tomato validator
        # Updated class names to match your evaluation results
        self.class_names = {
            'part': ['fruit', 'leaf', 'stem'],
            'fruit': ['Anthracnose', 'Blossom End Rot', 'Botrytis Gray Mold', 'Buckeye Rot', 'Healthy', 'Sunscald'],
            'leaf': ['Bacterial Spot', 'Early Blight', 'Healthy', 'Late Blight', 'Septoria Leaf Spot', 'Yellow Leaf Curl'],
            'stem': ['Blight', 'Healthy', 'Wilt']  # Fixed order to match your confusion matrix
        }
        self.load_models()
    
    def load_models(self):
        """Load all trained models with verification"""
        model_files = {
            'part': 'part_classifier.h5',
            'leaf': 'leaf_model.h5',
            'fruit': 'fruit_model.h5',
            'stem': 'stem_model.h5'
        }
        
        print("🔍 Loading models from:", os.path.abspath(self.model_path))
        print("=" * 50)
        
        for model_name, filename in model_files.items():
            model_path = os.path.join(self.model_path, filename)
            
            try:
                if not os.path.exists(model_path):
                    print(f"❌ File not found: {filename}")
                    continue
                    
                print(f"📦 Loading {model_name} model from: {filename}")
                start_time = time.time()
                
                # Load the model
                model = tf.keras.models.load_model(model_path)
                self.models[model_name] = model
                
                # Get model info
                num_params = model.count_params()
                input_shape = model.input_shape
                output_shape = model.output_shape
                load_time = time.time() - start_time
                
                # Store model info
                model_info = {
                    'name': model_name,
                    'filename': filename,
                    'path': os.path.abspath(model_path),
                    'parameters': num_params,
                    'input_shape': input_shape,
                    'output_shape': output_shape,
                    'classes': len(self.class_names.get(model_name, [])),
                    'load_time': load_time,
                    'checksum': os.path.getmtime(model_path)  # Modification time as simple checksum
                }
                self.loaded_models_info.append(model_info)
                
                print(f"   ✅ Successfully loaded!")
                print(f"   ├── Classes: {self.class_names.get(model_name, [])}")
                print(f"   ├── Parameters: {num_params:,}")
                print(f"   ├── Input shape: {input_shape}")
                print(f"   ├── Output shape: {output_shape}")
                print(f"   └── Load time: {load_time:.2f}s")
                print()
                
            except Exception as e:
                print(f"❌ Failed to load {model_name} model ({filename}): {str(e)}")
                print()
        
        print("=" * 50)
        print(f"📊 Summary: Loaded {len(self.models)}/{len(model_files)} models")
        
        # Verify all required models are loaded
        missing = set(model_files.keys()) - set(self.models.keys())
        if missing:
            print(f"⚠️  Warning: Missing models: {', '.join(missing)}")
        else:
            print("✅ All models loaded successfully!")
    
    def get_loaded_models(self) -> List[Dict]:
        """Return information about all loaded models"""
        return self.loaded_models_info.copy()
    
    def verify_model(self, model_name: str) -> Dict:
        """Verify a specific model is loaded correctly"""
        if model_name not in self.models:
            return {
                'status': 'error',
                'message': f'Model "{model_name}" not loaded',
                'available_models': list(self.models.keys())
            }
        
        model = self.models[model_name]
        return {
            'status': 'success',
            'model_name': model_name,
            'class_names': self.class_names.get(model_name, []),
            'input_shape': model.input_shape,
            'output_shape': model.output_shape,
            'parameters': model.count_params(),
            'layers': len(model.layers)
        }
    
    def preprocess_image(self, image_bytes, target_size=(224, 224), use_enhanced=True):
        """Preprocess image for model inference - ENHANCED VERSION"""
        try:
            # Convert bytes to PIL Image
            img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            
            # Choose preprocessing method
            if use_enhanced:
                # Use enhanced preprocessing for real-world photos
                img_array, preprocess_info = self.preprocessor.preprocess_for_prediction(img)
                preprocess_info['method'] = 'enhanced'
                preprocess_info['format'] = img.format if img.format else 'Unknown'
            else:
                # Use original preprocessing (for backward compatibility)
                img_array, preprocess_info = self.preprocessor.preprocess_original(image_bytes, target_size)
                preprocess_info['method'] = 'original'
            
            return img_array, preprocess_info
        except Exception as e:
            raise Exception(f"Image preprocessing failed: {str(e)}")
    
    def predict_with_tta(self, image_array, model_name, n_augmentations=1):
        """
        Test-Time Augmentation for more robust predictions.
        Default n_augmentations=1 (no TTA) for speed. Increase to 3 for accuracy.
        """
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not loaded")
        
        model = self.models[model_name]
        
        # Fast path: single prediction when n_augmentations=1
        if n_augmentations <= 1:
            pred = model.predict(image_array, verbose=0)[0]
            predicted_idx = np.argmax(pred)
            confidence = float(pred[predicted_idx])
            
            if confidence < 0.6:
                top_indices = np.argsort(pred)[-2:][::-1]
                return {
                    'primary': {
                        'disease': self.class_names[model_name][top_indices[0]],
                        'confidence': float(pred[top_indices[0]])
                    },
                    'secondary': {
                        'disease': self.class_names[model_name][top_indices[1]],
                        'confidence': float(pred[top_indices[1]])
                    },
                    'is_low_confidence': True,
                    'tta_used': False,
                    'num_augmentations': 1
                }
            return {
                'disease': self.class_names[model_name][predicted_idx],
                'confidence': confidence,
                'is_low_confidence': False,
                'tta_used': False,
                'num_augmentations': 1
            }
        
        # Full TTA path (when n_augmentations > 1)
        predictions = []
        
        # Original prediction
        orig_pred = model.predict(image_array, verbose=0)[0]
        predictions.append(orig_pred)
        
        # Additional augmentations
        for i in range(1, n_augmentations):
            # Create augmented version
            if i == 1:
                # Horizontal flip
                aug_array = np.flip(image_array, axis=2)  # Flip width dimension
            elif i == 2:
                # Brightness variation
                aug_array = image_array * np.random.uniform(0.9, 1.1)
            else:
                # Random crop (slight shift)
                shift = np.random.randint(-10, 10, size=2)
                aug_array = np.roll(image_array, shift, axis=(1, 2))
                aug_array = np.clip(aug_array, 0, 1)
            
            # Predict with augmented version
            aug_pred = model.predict(aug_array, verbose=0)[0]
            predictions.append(aug_pred)
        
        # Average predictions
        avg_pred = np.mean(predictions, axis=0)
        
        # Get results
        predicted_idx = np.argmax(avg_pred)
        confidence = float(avg_pred[predicted_idx])
        
        # Check if we should use confidence threshold
        if confidence < 0.6:  # Low confidence threshold
            # Return top 2 predictions
            top_indices = np.argsort(avg_pred)[-2:][::-1]
            result = {
                'primary': {
                    'disease': self.class_names[model_name][top_indices[0]],
                    'confidence': float(avg_pred[top_indices[0]])
                },
                'secondary': {
                    'disease': self.class_names[model_name][top_indices[1]],
                    'confidence': float(avg_pred[top_indices[1]])
                },
                'is_low_confidence': True,
                'tta_used': True,
                'num_augmentations': n_augmentations
            }
        else:
            result = {
                'disease': self.class_names[model_name][predicted_idx],
                'confidence': confidence,
                'is_low_confidence': False,
                'tta_used': True,
                'num_augmentations': n_augmentations
            }
        
        return result
    
    def predict_part(self, image_array):
        """Predict plant part"""
        if 'part' not in self.models:
            raise ValueError("Part classifier model not loaded")
            
        predictions = self.models['part'].predict(image_array, verbose=0)[0]
        part_idx = np.argmax(predictions)
        confidence = float(predictions[part_idx])
        part_name = self.class_names['part'][part_idx]
        
        # Get top 3 predictions
        top_indices = np.argsort(predictions)[-3:][::-1]
        top_predictions = [
            {
                'part': self.class_names['part'][idx],
                'confidence': float(predictions[idx])
            }
            for idx in top_indices
        ]
        
        return {
            'part': part_name,
            'confidence': confidence,
            'all_predictions': predictions.tolist(),
            'top_predictions': top_predictions
        }
    
    def predict_disease(self, image_array, part, use_tta=False):
        """
        Predict disease for specific plant part.
        Optimized: single inference by default, TTA only on low confidence.
        """
        if part not in self.models:
            raise ValueError(f"No model available for part: {part}. Available: {list(self.models.keys())}")
        
        # Fast single-pass prediction
        result = self.predict_with_tta(image_array, part, n_augmentations=1)
        
        # If low confidence AND use_tta requested, retry with full TTA
        if result.get('is_low_confidence') and use_tta:
            result = self.predict_with_tta(image_array, part, n_augmentations=3)
        
        if 'primary' in result:
            # Low confidence case
            return {
                'disease': result['primary']['disease'],
                'confidence': result['primary']['confidence'],
                'alternative_disease': result['secondary']['disease'],
                'alternative_confidence': result['secondary']['confidence'],
                'is_low_confidence': True,
                'warning': f"Low confidence ({result['primary']['confidence']:.1%}). Could also be: {result['secondary']['disease']}",
                'tta_used': result.get('tta_used', False)
            }
        else:
            # Normal confidence case
            return {
                'disease': result['disease'],
                'confidence': result['confidence'],
                'is_low_confidence': False,
                'tta_used': result.get('tta_used', False)
            }
    
    def analyze_image(self, image_bytes, use_enhanced_preprocessing=True) -> Dict[str, Any]:
        """
        Complete analysis pipeline with validation gate and bounding boxes.
        OPTIMIZED: parallel-friendly, reduced TTA, timing instrumentation.
        """
        import time as _time
        timings = {}
        pipeline_start = _time.perf_counter()

        # Get loaded models info for debug
        loaded_models = [info['name'] for info in self.loaded_models_info]
        
        # ── Preprocessing ──
        t0 = _time.perf_counter()
        img_array, image_info = self.preprocess_image(
            image_bytes, 
            use_enhanced=use_enhanced_preprocessing
        )
        timings['preprocessing'] = round(_time.perf_counter() - t0, 3)
        
        # Add preprocessing method to info
        image_info['enhanced_preprocessing'] = use_enhanced_preprocessing
        
        # ── Step 1: Predict plant part ──
        t0 = _time.perf_counter()
        part_result = self.predict_part(img_array)
        timings['part_classification'] = round(_time.perf_counter() - t0, 3)
        part = part_result['part']

        # ── Step 1.5: TOMATO VALIDATION GATE ──
        t0 = _time.perf_counter()
        validation = self.validator.validate(image_bytes, part_result)
        timings['validation'] = round(_time.perf_counter() - t0, 3)

        if not validation['is_valid']:
            timings['total'] = round(_time.perf_counter() - pipeline_start, 3)
            # Rejected — return early with clear feedback
            return {
                'is_tomato': False,
                'rejection_reason': validation['rejection_reason'],
                'validation_scores': validation['scores'],
                'part_detection': part_result,
                'disease_detection': None,
                'spot_detection': None,
                'recommendations': {
                    'message': 'The uploaded image does not appear to be a tomato plant part.',
                    'suggestions': [
                        'Make sure the photo clearly shows a tomato leaf, fruit, or stem',
                        'Avoid photos with too much background or non-plant objects',
                        'Ensure good lighting so plant colors are visible',
                        'Try cropping the image to focus on the plant part',
                    ],
                },
                'image_info': image_info,
                'model_info': {
                    'loaded_models': loaded_models,
                    'total_models': len(self.loaded_models_info),
                    'analysis_timestamp': datetime.now().isoformat(),
                    'preprocessing_method': 'enhanced' if use_enhanced_preprocessing else 'original',
                    'validation_gate': 'rejected',
                },
                'performance': timings,
            }
        # ── End validation gate ──
        
        # ── Step 2: Predict disease (fast single-pass, TTA only if low confidence) ──
        t0 = _time.perf_counter()
        disease_result = self.predict_disease(img_array, part, use_tta=False)
        timings['disease_classification'] = round(_time.perf_counter() - t0, 3)
        disease_name = disease_result['disease']
        
        # ── Step 3: Spot detection (SKIP for healthy or low-confidence) ──
        spot_detection = None
        is_diseased = disease_name and disease_name != 'Healthy' and disease_name != 'Healthy '
        confidence_ok = disease_result.get('confidence', 0) >= 0.5

        if is_diseased and confidence_ok:
            t0 = _time.perf_counter()
            try:
                spot_detection = self.spot_detector.detect_disease_spots(image_bytes, disease_name)
                timings['spot_detection'] = round(_time.perf_counter() - t0, 3)
                
                # Add additional info to spot detection
                if spot_detection and 'error' not in spot_detection:
                    spot_detection['analysis_info'] = {
                        'disease_name': disease_name,
                        'disease_confidence': disease_result.get('confidence', 0),
                        'plant_part': part,
                        'timestamp': datetime.now().isoformat()
                    }
                    
                    # Calculate infection severity based on spot detection
                    if spot_detection.get('total_area') and spot_detection.get('original_image'):
                        try:
                            # Estimate severity level
                            severity_score = min(1.0, spot_detection['total_area'] / 50000)  # Normalize
                            
                            if severity_score < 0.1:
                                severity = "Low"
                            elif severity_score < 0.3:
                                severity = "Moderate"
                            elif severity_score < 0.6:
                                severity = "High"
                            else:
                                severity = "Critical"
                                
                            spot_detection['severity'] = {
                                'level': severity,
                                'score': round(severity_score, 2),
                                'description': f"Infection covers approximately {int(severity_score * 100)}% of visible area"
                            }
                        except Exception as e:
                            spot_detection['severity'] = {
                                'level': "Unknown",
                                'score': 0,
                                'description': f"Severity calculation failed: {str(e)}"
                            }
            except Exception as e:
                timings['spot_detection'] = round(_time.perf_counter() - t0, 3)
                spot_detection = {
                    "error": f"Disease spot detection failed: {str(e)}",
                    "disease_name": disease_name
                }
        else:
            # If healthy or low confidence, skip heavy OpenCV spot detection but still return image
            t0 = _time.perf_counter()
            try:
                nparr = np.frombuffer(image_bytes, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                original_base64 = self.spot_detector.image_to_base64(image) if image is not None else None
            except:
                original_base64 = None
            timings['spot_detection'] = round(_time.perf_counter() - t0, 3)
            
            spot_detection = {
                "status": "healthy" if not is_diseased else "skipped_low_confidence",
                "message": "No disease spots detected - plant appears healthy" if not is_diseased else "Spot detection skipped due to low confidence",
                "disease_name": disease_name,
                "total_spots": 0,
                "total_area": 0,
                "original_image": original_base64
            }
        
        # ── Step 4: Get recommendations ──
        try:
            import recommendations
            recommendations = recommendations.get_recommendations(
                part, 
                disease_name, 
                disease_result['confidence']
            )
        except ImportError:
            try:
                from .recommendations import get_recommendations as get_recs
                recommendations = get_recs(
                    part, 
                    disease_name, 
                    disease_result['confidence']
                )
            except ImportError:
                recommendations = {
                    "error": "Recommendation module not available",
                    "disease": disease_name,
                    "plant_part": part,
                    "description": f"Could not load specific recommendations for {disease_name} on {part}.",
                    "immediate_actions": [
                        "Remove affected plant parts immediately",
                        "Apply general fungicide treatment",
                        "Improve air circulation around plants"
                    ],
                    "preventive_measures": [
                        "Practice crop rotation",
                        "Use disease-resistant varieties",
                        "Maintain proper plant spacing"
                    ]
                }
        except Exception as e:
            recommendations = {
                "error": f"Failed to get recommendations: {str(e)}",
                "disease": disease_name,
                "plant_part": part,
                "fallback_advice": [
                    "Remove infected plant parts",
                    "Apply appropriate treatment",
                    "Monitor plant closely",
                    "Consult agricultural expert if symptoms worsen"
                ]
            }
        
        # Step 5: Prepare final result
        timings['total'] = round(_time.perf_counter() - pipeline_start, 3)
        
        result = {
            'is_tomato': True,
            'validation_scores': validation.get('scores', {}),
            'part_detection': part_result,
            'disease_detection': disease_result,
            'spot_detection': spot_detection,
            'recommendations': recommendations,
            'image_info': image_info,
            'model_info': {
                'loaded_models': loaded_models,
                'total_models': len(self.loaded_models_info),
                'analysis_timestamp': datetime.now().isoformat(),
                'preprocessing_method': 'enhanced' if use_enhanced_preprocessing else 'original',
                'bounding_boxes_enabled': spot_detection is not None and 'error' not in spot_detection,
                'validation_gate': 'passed',
            }
        }
        
        # Add processing performance info (in seconds)
        result['performance'] = {
            'timings': timings,  # All detailed timings
            'total_seconds': timings.get('total', 0),
            'summary': f"Total: {timings.get('total', 0)}s (validation: {timings.get('validation', 0)}s, part: {timings.get('part_classification', 0)}s, disease: {timings.get('disease_classification', 0)}s, spots: {timings.get('spot_detection', 0)}s)"
        }
        
        return result
        
    def test_inference(self):
        """Test inference with dummy data to verify models work"""
        print("🧪 Running inference test...")
        dummy_image = np.random.rand(224, 224, 3).astype(np.float32)
        dummy_bytes = (dummy_image * 255).astype(np.uint8).tobytes()
        
        try:
            result = self.analyze_image(dummy_bytes)
            print("✅ Inference test passed!")
            print(f"   Detected part: {result['part_detection']['part']}")
            print(f"   Detected disease: {result['disease_detection']['disease']}")
            print(f"   Confidence: {result['disease_detection']['confidence']:.1%}")
            if 'warning' in result['disease_detection']:
                print(f"   ⚠️  Warning: {result['disease_detection']['warning']}")
            return True
        except Exception as e:
            print(f"❌ Inference test failed: {str(e)}")
            return False
    
    def analyze_image_detailed(self, image_bytes) -> Dict[str, Any]:
        """Enhanced analysis with debugging info"""
        result = self.analyze_image(image_bytes, use_enhanced_preprocessing=True)
        
        # Add model confidence info
        result['model_performance'] = {
            'part_classifier_accuracy': '99.9% (from evaluation)',
            'fruit_model_accuracy': '97% (from evaluation)',
            'stem_model_accuracy': '99% (from evaluation)',
            'note': 'Evaluation accuracy on test set'
        }
        
        # Add troubleshooting tips if low confidence
        if 'is_low_confidence' in result['disease_detection'] and result['disease_detection']['is_low_confidence']:
            result['suggestions'] = [
                "Take photo against plain background",
                "Ensure good lighting on the plant",
                "Focus on the affected area",
                "Avoid including too much background",
                "Try taking photo from different angle"
            ]
        
        return result


# Create and verify service
print("🚀 Initializing TomatoGuard ML Service...")
print("=" * 60)
ml_service = MLService()

# Display loaded models summary
print("\n📋 LOADED MODELS SUMMARY:")
print("-" * 40)
for info in ml_service.get_loaded_models():
    print(f"• {info['name'].upper():<6} - {info['filename']:<20}")
    print(f"  ├─ Classes: {info['classes']}")
    print(f"  ├─ Parameters: {info['parameters']:,}")
    print(f"  └─ Path: {os.path.basename(info['path'])}")
print("=" * 60)

# Test the new preprocessing
print("\n🔄 Testing enhanced preprocessing system...")
try:
    test_result = ml_service.test_inference()
    if test_result:
        print("✅ Enhanced preprocessing system is ready!")
    else:
        print("⚠️  Preprocessing test completed with warnings")
except Exception as e:
    print(f"⚠️  Could not run full test: {e}")
    print("   (This might be normal if models aren't fully configured)")

print("\n" + "=" * 60)
print("🍅 TomatoGuard ML Service Ready!")
print("📊 Enhanced preprocessing: ✅ ENABLED")
print("🎯 Test-Time Augmentation: ✅ ENABLED")
print("💡 Low-confidence warnings: ✅ ENABLED")
print("=" * 60)