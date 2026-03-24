import tensorflow as tf
from tensorflow import keras
import numpy as np
import os
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt
import json

def evaluate_fruit_model():
    """Evaluate the fruit disease classifier"""
    print("🍅 Evaluating Fruit Disease Model...")
    
    # Load model
    model_path = "backend/models/fruit_model.h5"
    if not os.path.exists(model_path):
        print(f"❌ Model not found: {model_path}")
        return
    
    model = keras.models.load_model(model_path)
    print(f"✅ Model loaded: {model_path}")
    
    # Load test data
    test_dir = "ml/data/processed_split/fruit/test"
    
    if not os.path.exists(test_dir):
        print(f"❌ Test directory not found: {test_dir}")
        return
    
    # Get class names from directory
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
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Reds',
                xticklabels=class_names, yticklabels=class_names)
    plt.title('Fruit Disease Classifier - Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig('ml/evaluation/fruit_confusion_matrix.png', dpi=300)
    print("📊 Confusion matrix saved to: ml/evaluation/fruit_confusion_matrix.png")
    
    # Confidence distribution
    print("\n📊 Confidence Distribution:")
    confidences = np.max(y_pred, axis=1)
    
    plt.figure(figsize=(12, 5))
    
    plt.subplot(1, 2, 1)
    plt.hist(confidences, bins=20, alpha=0.7, color='red')
    plt.title('Distribution of Prediction Confidence')
    plt.xlabel('Confidence')
    plt.ylabel('Count')
    
    plt.subplot(1, 2, 2)
    correct_conf = confidences[y_pred_classes == y_true]
    incorrect_conf = confidences[y_pred_classes != y_true]
    
    plt.boxplot([correct_conf, incorrect_conf], labels=['Correct', 'Incorrect'])
    plt.title('Confidence: Correct vs Incorrect Predictions')
    plt.ylabel('Confidence')
    
    plt.tight_layout()
    plt.savefig('ml/evaluation/fruit_confidence_analysislatest.png', dpi=300)
    print("📊 Confidence analysis saved to: ml/evaluation/fruit_confidence_analysislatest.png")
    
    # Per-class confidence
    print("\n🎯 Per-class Average Confidence:")
    for i, class_name in enumerate(class_names):
        class_mask = y_true == i
        if np.sum(class_mask) > 0:
            avg_conf = np.mean(confidences[class_mask])
            print(f"  {class_name}: {avg_conf:.4f} ({np.sum(class_mask)} samples)")
    
    # Save results
    print("\n💾 Saving results...")
    results = {
        'evaluation_metrics': dict(zip(model.metrics_names, evaluation)),
        'class_names': class_names,
        'accuracy': float(evaluation[1]),
        'avg_confidence': float(np.mean(confidences))
    }
    
    with open('ml/evaluation/fruit_evaluation_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print("✅ Evaluation complete!")
    return evaluation

if __name__ == "__main__":
    evaluate_fruit_model()