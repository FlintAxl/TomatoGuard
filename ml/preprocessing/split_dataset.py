import os
import random
import shutil

# Paths
processed_path = "../data/processed"
output_path = "../data/processed_split"
os.makedirs(output_path, exist_ok=True)

# Split ratios
train_ratio = 0.7
val_ratio = 0.2
test_ratio = 0.1

for category in ["leaf", "fruit"]:
    category_path = os.path.join(processed_path, category)
    for class_name in os.listdir(category_path):
        class_path = os.path.join(category_path, class_name)
        images = os.listdir(class_path)
        random.shuffle(images)

        n_total = len(images)
        n_train = int(n_total * train_ratio)
        n_val = int(n_total * val_ratio)

        splits = {
            "train": images[:n_train],
            "val": images[n_train:n_train+n_val],
            "test": images[n_train+n_val:]
        }

        for split_name, split_imgs in splits.items():
            split_class_path = os.path.join(output_path, split_name, category, class_name)
            os.makedirs(split_class_path, exist_ok=True)
            for img_name in split_imgs:
                shutil.copy(os.path.join(class_path, img_name), os.path.join(split_class_path, img_name))

print("Dataset splitting done!")
