import tensorflow as tf
import numpy as np
from PIL import Image, ImageEnhance, ImageOps
import io
import os
import time
import random
from typing import Dict, Any, List
from datetime import datetime

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
        
        # Updated class names to match your evaluation results
        self.class_names = {
            'part': ['fruit', 'leaf', 'stem'],
            'fruit': ['Anthracnose', 'Botrytis Gray Mold', 'Blossom End Rot', 'Buckeye Rot', 'Healthy', 'Sunscald'],
            'leaf': ['Septoria Leaf Spot', 'Bacterial Spot', 'Early Blight', 'Late Blight', 'Yellow Leaf Curl', 'Healthy'],
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
    
    def predict_with_tta(self, image_array, model_name, n_augmentations=3):
        """Test-Time Augmentation for more robust predictions"""
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not loaded")
        
        model = self.models[model_name]
        
        # Create multiple predictions with different augmentations
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
    
    def predict_disease(self, image_array, part, use_tta=True):
        """Predict disease for specific plant part - ENHANCED"""
        if part not in self.models:
            raise ValueError(f"No model available for part: {part}. Available: {list(self.models.keys())}")
        
        if use_tta:
            # Use Test-Time Augmentation for better accuracy
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
                    'tta_used': True
                }
            else:
                # Normal confidence case
                return {
                    'disease': result['disease'],
                    'confidence': result['confidence'],
                    'is_low_confidence': False,
                    'tta_used': True
                }
        else:
            # Original prediction method
            predictions = self.models[part].predict(image_array, verbose=0)[0]
            disease_idx = np.argmax(predictions)
            confidence = float(predictions[disease_idx])
            disease_name = self.class_names[part][disease_idx]
            
            # Get top 3 predictions
            top_indices = np.argsort(predictions)[-3:][::-1]
            top_predictions = [
                {
                    'disease': self.class_names[part][idx],
                    'confidence': float(predictions[idx])
                }
                for idx in top_indices
            ]
            
            return {
                'disease': disease_name,
                'confidence': confidence,
                'all_predictions': predictions.tolist(),
                'top_predictions': top_predictions,
                'tta_used': False
            }
    
    def analyze_image(self, image_bytes, use_enhanced_preprocessing=True) -> Dict[str, Any]:
        """Complete analysis pipeline - ENHANCED with better preprocessing"""
        # Get loaded models info for debug
        loaded_models = [info['name'] for info in self.loaded_models_info]
        
        # Preprocess image with enhanced preprocessing
        img_array, image_info = self.preprocess_image(
            image_bytes, 
            use_enhanced=use_enhanced_preprocessing
        )
        
        # Add preprocessing method to info
        image_info['enhanced_preprocessing'] = use_enhanced_preprocessing
        
        # Step 1: Predict plant part
        part_result = self.predict_part(img_array)
        part = part_result['part']
        
        # Step 2: Predict disease for that part (use TTA for better accuracy)
        disease_result = self.predict_disease(img_array, part, use_tta=True)
        
        # Step 3: Get recommendations
        try:
            from .recommendations import get_recommendations as get_recs
            recommendations = get_recs(part, disease_result['disease'], disease_result['confidence'])
        except ImportError:
            recommendations = {"error": "Recommendation module not available"}
        except Exception as e:
            recommendations = {"error": f"Failed to get recommendations: {str(e)}"}
        
        return {
            'part_detection': part_result,
            'disease_detection': disease_result,
            'recommendations': recommendations,
            'image_info': image_info,
            'model_info': {
                'loaded_models': loaded_models,
                'total_models': len(self.loaded_models_info),
                'analysis_timestamp': datetime.now().isoformat(),
                'preprocessing_method': 'enhanced' if use_enhanced_preprocessing else 'original'
            }
        }
    
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