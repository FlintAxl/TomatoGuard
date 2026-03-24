"""
Model Accuracy Comparison — all 4 models (fruit, leaf, stem, part classifier).
Uses existing saved models, no retraining required.

Output: ml/evaluation/model_accuracy_comparison.png

Usage:
  python ml/evaluation/model_accuracy_comparison.py
"""

import tensorflow as tf
from tensorflow import keras
import numpy as np
import os
import matplotlib.pyplot as plt
import seaborn as sns

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
os.chdir(BASE_DIR)

OUTPUT_DIR = "ml/evaluation"
os.makedirs(OUTPUT_DIR, exist_ok=True)

sns.set_theme(style="whitegrid")
plt.rcParams.update({'figure.dpi': 150, 'savefig.dpi': 300, 'font.size': 10})

MODELS = {
    'fruit': {
        'model_path': 'backend/models/fruit_model.h5',
        'test_dir': 'ml/data/processed_split/fruit/test',
        'color': '#e74c3c',
    },
    'leaf': {
        'model_path': 'backend/models/leaf_model.h5',
        'test_dir': 'ml/data/processed_split/leaf/test',
        'color': '#27ae60',
    },
    'stem': {
        'model_path': 'backend/models/stem_model.h5',
        'test_dir': 'ml/data/processed_split/stem/test',
        'color': '#8e44ad',
    },
    'part_classifier': {
        'model_path': 'backend/models/part_classifier_new.h5',
        'test_dir': 'ml/data/processed_split',
        'color': '#2980b9',
    },
}


def evaluate_model(name, cfg):
    if not os.path.exists(cfg['model_path']):
        print(f"  Model not found: {cfg['model_path']}")
        return None
    if not os.path.exists(cfg['test_dir']):
        print(f"  Test dir not found: {cfg['test_dir']}")
        return None

    model = keras.models.load_model(cfg['model_path'])

    # Part classifier uses the root processed_split dir (classes = fruit, leaf, stem, non_tomato)
    # Disease models use <part>/test subdirectory
    if name == 'part_classifier':
        test_path = cfg['test_dir']
        class_names = sorted(
            d for d in os.listdir(test_path)
            if os.path.isdir(os.path.join(test_path, d))
        )
        # Use the test split from each class folder
        # Part classifier was trained on the top-level folders; evaluate on test splits
        # Build a combined test generator from <class>/test/
        from tensorflow.keras.preprocessing.image import ImageDataGenerator
        import tempfile, shutil

        # Create a temp directory mirroring the structure the generator expects
        tmp_dir = os.path.join(OUTPUT_DIR, '_tmp_part_test')
        if os.path.exists(tmp_dir):
            shutil.rmtree(tmp_dir)
        os.makedirs(tmp_dir)

        for cls in class_names:
            src = os.path.join(test_path, cls, 'test')
            if os.path.exists(src):
                # For part classifier: class folder contains disease subfolders
                # Flatten all images into one class folder
                dst = os.path.join(tmp_dir, cls)
                os.makedirs(dst, exist_ok=True)
                for sub in os.listdir(src):
                    sub_path = os.path.join(src, sub)
                    if os.path.isdir(sub_path):
                        for img in os.listdir(sub_path):
                            src_img = os.path.join(sub_path, img)
                            if os.path.isfile(src_img):
                                # Prefix with subfolder name to avoid collisions
                                shutil.copy2(src_img, os.path.join(dst, f"{sub}_{img}"))
                    elif os.path.isfile(sub_path):
                        shutil.copy2(sub_path, os.path.join(dst, sub))

        test_gen = ImageDataGenerator(rescale=1./255).flow_from_directory(
            tmp_dir, target_size=(224, 224), batch_size=32,
            class_mode='categorical', shuffle=False,
        )
        loss, acc = model.evaluate(test_gen, verbose=0)
        shutil.rmtree(tmp_dir)
    else:
        test_path = cfg['test_dir']
        class_names = sorted(
            d for d in os.listdir(test_path)
            if os.path.isdir(os.path.join(test_path, d))
        )
        test_gen = keras.preprocessing.image.ImageDataGenerator(
            rescale=1./255
        ).flow_from_directory(
            test_path, target_size=(224, 224), batch_size=32,
            class_mode='categorical', shuffle=False, classes=class_names,
        )
        loss, acc = model.evaluate(test_gen, verbose=0)

    print(f"  {name:20s}  Accuracy: {acc*100:.2f}%  Loss: {loss:.4f}")
    return {'accuracy': acc, 'loss': loss}


def main():
    print("Evaluating all models...\n")
    results = {}

    for name, cfg in MODELS.items():
        r = evaluate_model(name, cfg)
        if r:
            results[name] = r

    if not results:
        print("No models evaluated successfully.")
        return

    # ── Plot ──────────────────────────────────────────────────────────────
    labels = [n.replace('_', ' ').title() for n in results]
    accuracies = [results[n]['accuracy'] * 100 for n in results]
    losses = [results[n]['loss'] for n in results]
    colors = [MODELS[n]['color'] for n in results]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    # Accuracy
    bars1 = ax1.bar(labels, accuracies, color=colors, edgecolor='white', width=0.5)
    ax1.set_ylim(0, 110)
    ax1.set_ylabel('Accuracy (%)')
    ax1.set_title('Test Accuracy Comparison', fontsize=14, fontweight='bold')
    for bar, acc in zip(bars1, accuracies):
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                 f'{acc:.2f}%', ha='center', fontweight='bold')

    # Loss
    bars2 = ax2.bar(labels, losses, color=colors, edgecolor='white', width=0.5)
    ax2.set_ylabel('Loss')
    ax2.set_title('Test Loss Comparison', fontsize=14, fontweight='bold')
    for bar, l in zip(bars2, losses):
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.003,
                 f'{l:.4f}', ha='center', fontweight='bold', fontsize=9)

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, 'model_accuracy_comparison.png')
    plt.savefig(path)
    plt.close()
    print(f"\nSaved → {path}")


if __name__ == '__main__':
    main()
