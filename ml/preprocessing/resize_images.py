import os
import cv2
from PIL import Image
import numpy as np

def resize_and_save_images(source_dir, target_dir, size=(224, 224)):
    """Resize images to target size and save"""
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
    
    # Check if source directory exists
    if not os.path.exists(source_dir):
        print(f"Warning: Source directory {source_dir} does not exist")
        return
    
    # Check if there are any subdirectories in source_dir
    has_subdirs = False
    for item in os.listdir(source_dir):
        item_path = os.path.join(source_dir, item)
        if os.path.isdir(item_path):
            has_subdirs = True
            break
    
    if has_subdirs:
        # Case 1: Source has class subdirectories
        for class_name in os.listdir(source_dir):
            class_path = os.path.join(source_dir, class_name)
            if not os.path.isdir(class_path):
                continue
                
            target_class_dir = os.path.join(target_dir, class_name)
            if not os.path.exists(target_class_dir):
                os.makedirs(target_class_dir)
            
            process_images_in_directory(class_path, target_class_dir, size)
    else:
        # Case 2: Source has images directly in the directory
        print(f"No subdirectories found in {source_dir}, processing images directly...")
        target_class_dir = os.path.join(target_dir, os.path.basename(source_dir))
        if not os.path.exists(target_class_dir):
            os.makedirs(target_class_dir)
        
        process_images_in_directory(source_dir, target_class_dir, size)

def process_images_in_directory(source_dir, target_dir, size):
    """Process all images in a directory"""
    processed_count = 0
    skipped_count = 0
    
    for img_name in os.listdir(source_dir):
        img_path = os.path.join(source_dir, img_name)
        
        # Skip directories
        if os.path.isdir(img_path):
            continue
            
        # Check if it's an image file
        if not img_name.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
            print(f"Skipping non-image file: {img_name}")
            skipped_count += 1
            continue
        
        try:
            # Read and resize image
            img = cv2.imread(img_path)
            if img is None:
                print(f"Could not read image: {img_path}")
                skipped_count += 1
                continue
                
            img = cv2.resize(img, size)
            # Convert BGR to RGB
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Save resized image
            target_path = os.path.join(target_dir, img_name)
            cv2.imwrite(target_path, cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
            processed_count += 1
            
        except Exception as e:
            print(f"Error processing {img_path}: {e}")
            skipped_count += 1
    
    print(f"Processed {processed_count} images in {source_dir}")
    print(f"Skipped {skipped_count} files")
    print("-" * 40)

# Process all plant parts
if __name__ == "__main__":
    base_raw = "ml/data/raw"
    base_processed = "ml/data/processed"
    
    # Make sure we're using absolute paths or correct relative paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_raw = os.path.join(current_dir, "..", "data", "raw")
    base_processed = os.path.join(current_dir, "..", "data", "processed")
    
    print(f"Raw data path: {base_raw}")
    print(f"Processed data path: {base_processed}")
    print("=" * 50)
    
    for part in ['fruit', 'leaf', 'stem', 'non_tomato']:
        source = os.path.join(base_raw, part)
        target = os.path.join(base_processed, part)
        
        print(f"Processing {part}...")
        print(f"Source: {source}")
        print(f"Target: {target}")
        
        if os.path.exists(source):
            resize_and_save_images(source, target)
        else:
            print(f"Warning: Source directory {source} does not exist")
        
        print("=" * 50)