import tensorflow as tf
from tensorflow import keras
import numpy as np
import os
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt
import json

def evaluate_stem_model():
    """Evaluate the stem disease classifier"""
    print("🌿 Evaluating Stem Disease Model...")
    
    # Load model
    model_path = "backend/models/stem_model.h5"
    if not os.path.exists(model_path):
        print(f"❌ Model not found: {model_path}")
        return
    
    model = keras.models.load_model(model_path)
    print(f"✅ Model loaded: {model_path}")
    
    # Load test data
    test_dir = "ml/data/processed_split/stem/test"
    
    if not os.path.exists(test_dir):
        print(f"⚠️  Test directory not found: {test_dir}")
        print("   Creating dummy evaluation for placeholder model...")
        return evaluate_placeholder_stem(model)
    
    # Get class names
    class_names = sorted([d for d in os.listdir(test_dir) 
                         if os.path.isdir(os.path.join(test_dir, d))])
    
    print(f"📁 Classes: {class_names}")
    print(f"📁 Test directory: {test_dir}")
    
    # Create test generator
    test_datagen = keras.preprocessing.image.ImageDataGenerator(rescale=1./255)
    
    test_generator = test_datagen.flow_from_directory(
        test_dir,
        target_size=(224, 224),
        batch_size=32,
        class_mode='categorical',
        shuffle=False,
        classes=class_names
    )
    
    # Evaluate
    print("\n🧪 Evaluating on test set...")
    evaluation = model.evaluate(test_generator, verbose=1)
    
    print(f"\n📈 Evaluation Results:")
    for metric, value in zip(model.metrics_names, evaluation):
        print(f"  {metric}: {value:.4f}")
    
    # Predictions
    print("\n🔍 Generating predictions...")
    y_pred = model.predict(test_generator, verbose=1)
    y_pred_classes = np.argmax(y_pred, axis=1)
    y_true = test_generator.classes
    
    # Classification report
    print("\n📋 Classification Report:")
    print(classification_report(y_true, y_pred_classes, target_names=class_names))
    
    # Confusion matrix
    print("\n🎯 Confusion Matrix:")
    cm = confusion_matrix(y_true, y_pred_classes)
    print(cm)
    
    # Plot confusion matrix
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Purples',
                xticklabels=class_names, yticklabels=class_names)
    plt.title('Stem Disease Classifier - Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig('ml/evaluation/stem_confusion_matrix.png', dpi=300)
    print("📊 Confusion matrix saved to: ml/evaluation/stem_confusion_matrix.png")
    
    # Save results
    print("\n💾 Saving results...")
    results = {
        'evaluation_metrics': dict(zip(model.metrics_names, evaluation)),
        'class_names': class_names,
        'accuracy': float(evaluation[1])
    }
    
    with open('ml/evaluation/stem_evaluation_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print("✅ Evaluation complete!")
    return evaluation

def evaluate_placeholder_stem(model):
    """Evaluate placeholder stem model"""
    print("\n📝 Placeholder Stem Model Evaluation:")
    print("   This is a placeholder model that always predicts 'healthy'")
    print("   Accuracy will depend on your test data distribution")
    
    # Test with random images
    test_images = tf.random.normal([10, 224, 224, 3])
    predictions = model.predict(test_images, verbose=0)
    
    print(f"\n🧪 Sample predictions shape: {predictions.shape}")
    print(f"   Model expects {predictions.shape[1]} output classes")
    
    # Check if it's biased toward healthy (class 2)
    avg_predictions = np.mean(predictions, axis=0)
    print(f"\n📊 Average predictions per class:")
    for i, avg_prob in enumerate(avg_predictions):
        print(f"   Class {i}: {avg_prob:.4f}")
    
    print("\n⚠️  Note: Train proper stem model when you have stem disease images")
    
    return [0.0, 0.33]  # Placeholder metrics

if __name__ == "__main__":
    evaluate_stem_model()