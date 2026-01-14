import os
from PIL import Image

# Paths
data_path = "../data/raw"
output_path = "../data/processed"

# Target size
IMG_SIZE = (224, 224)

# Loop through leaf and fruit
for category in ["leaf", "fruit"]:
    category_path = os.path.join(data_path, category)
    output_category_path = os.path.join(output_path, category)
    os.makedirs(output_category_path, exist_ok=True)

    for class_name in os.listdir(category_path):
        class_path = os.path.join(category_path, class_name)
        output_class_path = os.path.join(output_category_path, class_name)
        os.makedirs(output_class_path, exist_ok=True)

        for img_name in os.listdir(class_path):
            try:
                img_path = os.path.join(class_path, img_name)
                img = Image.open(img_path).convert("RGB")
                img = img.resize(IMG_SIZE)
                img.save(os.path.join(output_class_path, img_name))
            except Exception as e:
                print(f"Error processing {img_name}: {e}")

print("Resizing done!")
