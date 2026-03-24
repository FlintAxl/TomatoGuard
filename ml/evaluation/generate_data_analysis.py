"""
Generate comprehensive Data Analysis graphs for fruit, leaf, and stem models.
Uses EXISTING saved models — NO retraining required.

Outputs saved to: ml/evaluation/

Graphs generated per model:
  1. Confusion Matrix (heatmap)
  2. Classification Report (Precision / Recall / F1 bar chart)
  3. ROC Curve with AUC per class
  4. Confidence Distribution (histogram + correct vs incorrect boxplot)

Combined graphs:
  5. Model Accuracy Comparison (bar chart across all 3 models)
  6. Dataset Class Distribution (bar chart per split)

Usage:
  python ml/evaluation/generate_data_analysis.py
  python ml/evaluation/generate_data_analysis.py fruit leaf     # specific models only
"""

import tensorflow as tf
from tensorflow import keras
import numpy as np
import os
import sys
import json
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    classification_report, confusion_matrix,
    roc_curve, auc, precision_recall_fscore_support
)
from itertools import cycle

# ── Setup ─────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
os.chdir(BASE_DIR)

OUTPUT_DIR = "ml/evaluation"
os.makedirs(OUTPUT_DIR, exist_ok=True)

sns.set_theme(style="whitegrid")
plt.rcParams.update({'figure.dpi': 150, 'savefig.dpi': 300, 'font.size': 10})

# ── Model configs ─────────────────────────────────────────────────────────────
MODELS = {
    'fruit': {
        'model_path': 'backend/models/fruit_model.h5',
        'test_dir': 'ml/data/processed_split/fruit/test',
        'color': 'Reds',
        'color_accent': '#e74c3c',
    },
    'leaf': {
        'model_path': 'backend/models/leaf_model.h5',
        'test_dir': 'ml/data/processed_split/leaf/test',
        'color': 'Greens',
        'color_accent': '#27ae60',
    },
    'stem': {
        'model_path': 'backend/models/stem_model.h5',
        'test_dir': 'ml/data/processed_split/stem/test',
        'color': 'Purples',
        'color_accent': '#8e44ad',
    },
}


# ── Helper: load model + test data ───────────────────────────────────────────
def load_model_and_data(name):
    cfg = MODELS[name]

    if not os.path.exists(cfg['model_path']):
        print(f"  Model not found: {cfg['model_path']}")
        return None
    if not os.path.exists(cfg['test_dir']):
        print(f"  Test dir not found: {cfg['test_dir']}")
        return None

    model = keras.models.load_model(cfg['model_path'])
    class_names = sorted(
        d for d in os.listdir(cfg['test_dir'])
        if os.path.isdir(os.path.join(cfg['test_dir'], d))
    )

    test_gen = keras.preprocessing.image.ImageDataGenerator(
        rescale=1./255
    ).flow_from_directory(
        cfg['test_dir'],
        target_size=(224, 224),
        batch_size=32,
        class_mode='categorical',
        shuffle=False,
        classes=class_names,
    )

    y_pred_proba = model.predict(test_gen, verbose=0)
    y_pred = np.argmax(y_pred_proba, axis=1)
    y_true = test_gen.classes
    loss, acc = model.evaluate(test_gen, verbose=0)

    return {
        'model': model,
        'class_names': class_names,
        'y_true': y_true,
        'y_pred': y_pred,
        'y_pred_proba': y_pred_proba,
        'loss': loss,
        'accuracy': acc,
        'cfg': cfg,
    }


# ── 1. Confusion Matrix ──────────────────────────────────────────────────────
def plot_confusion_matrix(name, data):
    cm = confusion_matrix(data['y_true'], data['y_pred'])
    class_names = data['class_names']

    fig, ax = plt.subplots(figsize=(max(8, len(class_names)*1.4),
                                     max(6, len(class_names)*1.1)))
    sns.heatmap(cm, annot=True, fmt='d', cmap=data['cfg']['color'],
                xticklabels=class_names, yticklabels=class_names, ax=ax)
    ax.set_title(f'{name.capitalize()} Model — Confusion Matrix', fontsize=14, fontweight='bold')
    ax.set_ylabel('True Label')
    ax.set_xlabel('Predicted Label')
    plt.tight_layout()

    path = os.path.join(OUTPUT_DIR, f'{name}_confusion_matrix.png')
    plt.savefig(path)
    plt.close()
    print(f"  [1/4] Confusion matrix       → {path}")


# ── 2. Classification Report Bar Chart ────────────────────────────────────────
def plot_classification_report(name, data):
    class_names = data['class_names']
    precision, recall, f1, support = precision_recall_fscore_support(
        data['y_true'], data['y_pred'], labels=range(len(class_names)))

    x = np.arange(len(class_names))
    width = 0.25

    fig, ax = plt.subplots(figsize=(max(10, len(class_names)*1.8), 5))
    bars1 = ax.bar(x - width, precision, width, label='Precision', color='#3498db')
    bars2 = ax.bar(x,         recall,    width, label='Recall',    color='#e67e22')
    bars3 = ax.bar(x + width, f1,        width, label='F1-Score',  color='#2ecc71')

    ax.set_ylim(0, 1.15)
    ax.set_ylabel('Score')
    ax.set_title(f'{name.capitalize()} Model — Per-Class Precision / Recall / F1',
                 fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels([c.replace('_', ' ').title() for c in class_names],
                       rotation=30, ha='right')
    ax.legend()

    # Value labels on bars
    for bars in [bars1, bars2, bars3]:
        for bar in bars:
            h = bar.get_height()
            ax.annotate(f'{h:.2f}', xy=(bar.get_x() + bar.get_width()/2, h),
                        xytext=(0, 3), textcoords='offset points',
                        ha='center', va='bottom', fontsize=7)

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, f'{name}_classification_report.png')
    plt.savefig(path)
    plt.close()
    print(f"  [2/4] Classification report   → {path}")


# ── 3. ROC Curve with AUC ────────────────────────────────────────────────────
def plot_roc_curve(name, data):
    class_names = data['class_names']
    n_classes = len(class_names)
    y_true_bin = np.eye(n_classes)[data['y_true']]
    y_score = data['y_pred_proba']

    fig, ax = plt.subplots(figsize=(8, 6))
    colors = cycle(plt.cm.tab10.colors)

    for i, (cls, color) in enumerate(zip(class_names, colors)):
        fpr, tpr, _ = roc_curve(y_true_bin[:, i], y_score[:, i])
        roc_auc = auc(fpr, tpr)
        label = cls.replace('_', ' ').title()
        ax.plot(fpr, tpr, color=color, lw=2, label=f'{label} (AUC = {roc_auc:.3f})')

    ax.plot([0, 1], [0, 1], 'k--', lw=1, alpha=0.5)
    ax.set_xlim([0, 1])
    ax.set_ylim([0, 1.05])
    ax.set_xlabel('False Positive Rate')
    ax.set_ylabel('True Positive Rate')
    ax.set_title(f'{name.capitalize()} Model — ROC Curve (One-vs-Rest)',
                 fontsize=14, fontweight='bold')
    ax.legend(loc='lower right', fontsize=8)
    plt.tight_layout()

    path = os.path.join(OUTPUT_DIR, f'{name}_roc_curve.png')
    plt.savefig(path)
    plt.close()
    print(f"  [3/4] ROC curve               → {path}")


# ── 4. Confidence Distribution ────────────────────────────────────────────────
def plot_confidence(name, data):
    confidences = np.max(data['y_pred_proba'], axis=1)
    correct = data['y_pred'] == data['y_true']

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

    ax1.hist(confidences, bins=30, alpha=0.7, color=data['cfg']['color_accent'], edgecolor='white')
    ax1.set_title('Prediction Confidence Distribution')
    ax1.set_xlabel('Confidence')
    ax1.set_ylabel('Count')

    correct_conf = confidences[correct]
    incorrect_conf = confidences[~correct]
    bp = ax2.boxplot(
        [correct_conf] + ([incorrect_conf] if len(incorrect_conf) > 0 else []),
        labels=['Correct'] + (['Incorrect'] if len(incorrect_conf) > 0 else []),
        patch_artist=True,
    )
    for patch, color in zip(bp['boxes'], ['#2ecc71', '#e74c3c']):
        patch.set_facecolor(color)
        patch.set_alpha(0.6)
    ax2.set_title('Confidence: Correct vs Incorrect')
    ax2.set_ylabel('Confidence')

    fig.suptitle(f'{name.capitalize()} Model — Confidence Analysis',
                 fontsize=14, fontweight='bold')
    plt.tight_layout()

    path = os.path.join(OUTPUT_DIR, f'{name}_confidence_analysis.png')
    plt.savefig(path)
    plt.close()
    print(f"  [4/4] Confidence analysis     → {path}")


# ── 5. Combined: Model Accuracy Comparison ───────────────────────────────────
def plot_accuracy_comparison(results):
    names = [n.capitalize() for n in results]
    accuracies = [results[n]['accuracy'] * 100 for n in results]
    losses = [results[n]['loss'] for n in results]
    colors = [MODELS[n]['color_accent'] for n in results]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

    bars = ax1.bar(names, accuracies, color=colors, edgecolor='white', width=0.5)
    ax1.set_ylim(0, 110)
    ax1.set_ylabel('Accuracy (%)')
    ax1.set_title('Test Accuracy Comparison', fontsize=13, fontweight='bold')
    for bar, acc in zip(bars, accuracies):
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                 f'{acc:.2f}%', ha='center', fontweight='bold')

    bars2 = ax2.bar(names, losses, color=colors, edgecolor='white', width=0.5)
    ax2.set_ylabel('Loss')
    ax2.set_title('Test Loss Comparison', fontsize=13, fontweight='bold')
    for bar, l in zip(bars2, losses):
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.002,
                 f'{l:.4f}', ha='center', fontweight='bold', fontsize=9)

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, 'model_accuracy_comparison.png')
    plt.savefig(path)
    plt.close()
    print(f"\n  Model accuracy comparison → {path}")


# ── 6. Dataset Class Distribution ─────────────────────────────────────────────
def plot_dataset_distribution():
    fig, axes = plt.subplots(1, 3, figsize=(18, 6))

    for ax, (name, cfg) in zip(axes, MODELS.items()):
        split_dir = os.path.dirname(cfg['test_dir'])  # processed_split/<part>
        splits = ['train', 'val', 'test']
        class_names = sorted(
            d for d in os.listdir(os.path.join(split_dir, 'train'))
            if os.path.isdir(os.path.join(split_dir, 'train', d))
        )

        counts = {s: [] for s in splits}
        for split in splits:
            for cls in class_names:
                p = os.path.join(split_dir, split, cls)
                counts[split].append(len(os.listdir(p)) if os.path.exists(p) else 0)

        x = np.arange(len(class_names))
        width = 0.25
        ax.bar(x - width, counts['train'], width, label='Train', color='#3498db')
        ax.bar(x,         counts['val'],   width, label='Val',   color='#e67e22')
        ax.bar(x + width, counts['test'],  width, label='Test',  color='#2ecc71')
        ax.set_title(f'{name.capitalize()} Dataset Distribution',
                     fontsize=12, fontweight='bold')
        ax.set_xticks(x)
        ax.set_xticklabels([c.replace('_', ' ').title() for c in class_names],
                           rotation=35, ha='right', fontsize=8)
        ax.set_ylabel('Number of Images')
        ax.legend(fontsize=8)

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, 'dataset_distribution.png')
    plt.savefig(path)
    plt.close()
    print(f"  Dataset distribution      → {path}")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    targets = sys.argv[1:] if len(sys.argv) > 1 else list(MODELS.keys())

    results = {}

    for name in targets:
        if name not in MODELS:
            print(f"Unknown model '{name}'. Choose from: {list(MODELS.keys())}")
            continue

        print(f"\n{'='*60}")
        print(f"  {name.upper()} MODEL")
        print(f"{'='*60}")

        data = load_model_and_data(name)
        if data is None:
            continue

        print(f"  Accuracy: {data['accuracy']*100:.2f}%  |  Loss: {data['loss']:.4f}")
        print(f"  Classes:  {data['class_names']}")
        print(f"  Samples:  {len(data['y_true'])}\n")

        plot_confusion_matrix(name, data)
        plot_classification_report(name, data)
        plot_roc_curve(name, data)
        plot_confidence(name, data)

        results[name] = data

    # Combined graphs (only if multiple models)
    if len(results) >= 2:
        print(f"\n{'='*60}")
        print(f"  COMBINED GRAPHS")
        print(f"{'='*60}")
        plot_accuracy_comparison(results)

    plot_dataset_distribution()

    print(f"\n{'='*60}")
    print(f"  All graphs saved to: {OUTPUT_DIR}/")
    print(f"{'='*60}")


if __name__ == '__main__':
    main()
