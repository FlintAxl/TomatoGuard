import tensorflow as tf
from tensorflow import keras
import numpy as np
import os
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

def evaluate_part_classifier():
    """Evaluate the plant part classifier"""
    print("📊 Evaluating Part Classifier...")
    
    # Load model
    model_path = "backend/models/part_classifier_new.h5"
    if not os.path.exists(model_path):
        print(f"❌ Model not found: {model_path}")
        return
    
    model = keras.models.load_model(model_path)
    print(f"✅ Model loaded: {model_path}")
    
    # Load test data
    test_dir = "ml/data/processed_split"
    
    if not os.path.exists(test_dir):
        print(f"❌ Test directory not found: {test_dir}")
        return
    
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
        shuffle=False,  # Important for evaluation
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
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=class_names, yticklabels=class_names)
    plt.title('Part Classifier - Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig('ml/evaluation/part_classifier_confusion_matrix.png')
    print("📊 Confusion matrix saved to: ml/evaluation/part_classifier_confusion_matrix.png")
    
    # Per-class accuracy
    print("\n🎯 Per-class Accuracy:")
    for i, class_name in enumerate(class_names):
        class_mask = y_true == i
        if np.sum(class_mask) > 0:
            class_acc = np.mean(y_pred_classes[class_mask] == i)
            print(f"  {class_name}: {class_acc:.4f} ({np.sum(class_mask)} samples)")
    
    # Save predictions for error analysis
    print("\n💾 Saving predictions...")
    np.save('ml/evaluation/part_classifier_predictions.npy', y_pred)
    np.save('ml/evaluation/part_classifier_true_labels.npy', y_true)
    
    return evaluation

if __name__ == "__main__":
    evaluate_part_classifier()