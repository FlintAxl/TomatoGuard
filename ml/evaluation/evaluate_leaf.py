import tensorflow as tf
from tensorflow import keras
import numpy as np
import os
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt
import json

def evaluate_leaf_model():
    """Evaluate the leaf disease classifier"""
    print("🍃 Evaluating Leaf Disease Model...")
    
    # Load model
    model_path = "backend/models/leaf_model.h5"
    if not os.path.exists(model_path):
        print(f"❌ Model not found: {model_path}")
        return
    model = keras.models.load_model(model_path)
    print(f"✅ Model loaded: {model_path}")
    
    # Load class names
    class_names_path = "ml/models/leaf_class_names.json"
    if os.path.exists(class_names_path):
        with open(class_names_path, 'r') as f:
            class_names = json.load(f)
        print(f"📁 Classes from file: {class_names}")
    else:
        # Fallback to directory structure
        test_dir = "ml/data/processed_split/leaf/test"
        if os.path.exists(test_dir):
            class_names = sorted([d for d in os.listdir(test_dir) 
                                 if os.path.isdir(os.path.join(test_dir, d))])
        else:
            print(f"❌ Test directory not found: {test_dir}")
            return
    
    print(f"📁 Classes: {class_names}")
    
    # Load test data
    test_dir = "ml/data/processed_split/leaf/test"
    
    if not os.path.exists(test_dir):
        print(f"❌ Test directory not found: {test_dir}")
        return
    
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
    plt.figure(figsize=(12, 10))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Greens',
                xticklabels=class_names, yticklabels=class_names)
    plt.title('Leaf Disease Classifier - Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig('ml/evaluation/leaf_confusion_matrix.png', dpi=300)
    print("📊 Confusion matrix saved to: ml/evaluation/leaf_confusion_matrix.png")
    
    # Per-class metrics
    print("\n🎯 Per-class Metrics:")
    for i, class_name in enumerate(class_names):
        class_mask = y_true == i
        if np.sum(class_mask) > 0:
            tp = np.sum((y_true == i) & (y_pred_classes == i))
            fp = np.sum((y_true != i) & (y_pred_classes == i))
            fn = np.sum((y_true == i) & (y_pred_classes != i))
            
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0
            f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
            
            print(f"  {class_name}:")
            print(f"    Precision: {precision:.4f}")
            print(f"    Recall: {recall:.4f}")
            print(f"    F1-Score: {f1:.4f}")
            print(f"    Samples: {np.sum(class_mask)}")
    
    # Top-2 accuracy
    print("\n🥈 Top-2 Accuracy:")
    top2_correct = 0
    for i in range(len(y_true)):
        top2_preds = np.argsort(y_pred[i])[-2:][::-1]
        if y_true[i] in top2_preds:
            top2_correct += 1
    
    top2_acc = top2_correct / len(y_true)
    print(f"  Top-2 Accuracy: {top2_acc:.4f}")
    
    # Save detailed results
    print("\n💾 Saving detailed results...")
    results = {
        'evaluation_metrics': dict(zip(model.metrics_names, evaluation)),
        'classification_report': classification_report(y_true, y_pred_classes, 
                                                     target_names=class_names, output_dict=True),
        'confusion_matrix': cm.tolist(),
        'predictions': y_pred.tolist(),
        'true_labels': y_true.tolist(),
        'class_names': class_names
    }
    
    with open('ml/evaluation/leaf_evaluation_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print("✅ Evaluation complete!")
    return evaluation

if __name__ == "__main__":
    evaluate_leaf_model()