import os
import shutil
import numpy as np
from sklearn.model_selection import train_test_split

def split_dataset(source_dir, target_base_dir, test_size=0.2, val_size=0.1):
    """Split dataset into train/val/test folders with better error handling"""
    
    # First, check if source directory exists
    if not os.path.exists(source_dir):
        print(f"❌ Source directory not found: {source_dir}")
        return
    
    # Check if source has subdirectories (classes) or just images
    has_subdirs = False
    images_direct = []
    
    for item in os.listdir(source_dir):
        item_path = os.path.join(source_dir, item)
        if os.path.isdir(item_path):
            has_subdirs = True
            break
        elif item.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.gif')):
            images_direct.append(item)
    
    # CASE 1: Source has class subdirectories
    if has_subdirs:
        # Get all class directories
        class_dirs = []
        for item in os.listdir(source_dir):
            item_path = os.path.join(source_dir, item)
            if os.path.isdir(item_path):
                class_dirs.append(item)
        
        if not class_dirs:
            print(f"⚠️  No class directories found in {source_dir}")
            return
        
        print(f"\n📁 Processing: {os.path.basename(source_dir)}")
        print(f"   Found {len(class_dirs)} classes")
        
        for class_name in class_dirs:
            class_path = os.path.join(source_dir, class_name)
            
            # Get all images in class
            images = [f for f in os.listdir(class_path) 
                     if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.gif'))]
            
            process_images(images, class_path, target_base_dir, class_name)
    
    # CASE 2: Source has images directly (no subdirectories)
    elif len(images_direct) > 0:
        print(f"\n📁 Processing: {os.path.basename(source_dir)} (direct images)")
        print(f"   Found {len(images_direct)} images")
        
        # Use the source directory name as the class name
        class_name = os.path.basename(source_dir)  # This will be 'non_tomato'
        
        # Process all images as a single class
        process_images(images_direct, source_dir, target_base_dir, class_name)
    
    else:
        print(f"⚠️  No images found in {source_dir}")

def process_images(images, source_dir, target_base_dir, class_name, test_size=0.2, val_size=0.1):
    """Helper function to process and split images"""
    
    if len(images) == 0:
        print(f"   ⚠️  No images found for class: {class_name}")
        return
    
    # Ensure minimum samples for splitting
    min_samples = 5  # Minimum images needed
    if len(images) < min_samples:
        print(f"   ⚠️  Class {class_name} has only {len(images)} images. Using all for training.")
        
        # Create directory and copy all images to train
        train_dir = os.path.join(target_base_dir, 'train', class_name)
        os.makedirs(train_dir, exist_ok=True)
        
        for img_name in images:
            src = os.path.join(source_dir, img_name)
            dst = os.path.join(train_dir, img_name)
            shutil.copy2(src, dst)
        
        print(f"   {class_name}: All {len(images)} -> train")
        return
    
    # Split: train -> 70%, val -> 15%, test -> 15%
    try:
        train_val, test = train_test_split(
            images, 
            test_size=test_size, 
            random_state=42,
            shuffle=True
        )
        
        # Calculate validation split from remaining
        val_ratio = val_size / (1 - test_size)
        train, val = train_test_split(
            train_val, 
            test_size=val_ratio, 
            random_state=42,
            shuffle=True
        )
        
        # Create directories and copy images
        for split_name, split_images in [('train', train), ('val', val), ('test', test)]:
            split_class_dir = os.path.join(target_base_dir, split_name, class_name)
            os.makedirs(split_class_dir, exist_ok=True)
            
            for img_name in split_images:
                src = os.path.join(source_dir, img_name)
                dst = os.path.join(split_class_dir, img_name)
                shutil.copy2(src, dst)
        
        print(f"   {class_name}: Train={len(train)}, Val={len(val)}, Test={len(test)}")
        
    except Exception as e:
        print(f"   ❌ Error splitting {class_name}: {str(e)}")
        print(f"   Images: {len(images)}")
        
        # Fallback: put all in train
        train_dir = os.path.join(target_base_dir, 'train', class_name)
        os.makedirs(train_dir, exist_ok=True)
        
        for img_name in images:
            src = os.path.join(source_dir, img_name)
            dst = os.path.join(train_dir, img_name)
            shutil.copy2(src, dst)
        
        print(f"   {class_name}: All {len(images)} -> train (fallback)")

def create_directories(base_dir):
    """Create necessary directories"""
    for split in ['train', 'val', 'test']:
        split_dir = os.path.join(base_dir, split)
        os.makedirs(split_dir, exist_ok=True)
        print(f"Created directory: {split_dir}")

if __name__ == "__main__":
    base_processed = "ml/data/processed"
    base_split = "ml/data/processed_split"
    
    # Create base directories
    create_directories(base_split)
    
    # Process each plant part
    for part in ['fruit', 'leaf', 'stem', 'non_tomato']:
        source = os.path.join(base_processed, part)
        target = os.path.join(base_split, part)
        
        # Create target directory
        create_directories(target)
        
        # Split dataset
        split_dataset(source, target)
    
    print("\n✅ All datasets processed!")
    
    # Summary
    print("\n📊 Dataset Summary:")
    for part in ['fruit', 'leaf', 'stem', 'non_tomato']:
        target = os.path.join(base_split, part)
        if os.path.exists(target):
            print(f"\n{part.upper()}:")
            for split in ['train', 'val', 'test']:
                split_path = os.path.join(target, split)
                if os.path.exists(split_path):
                    classes = os.listdir(split_path)
                    total_images = 0
                    for cls in classes:
                        cls_path = os.path.join(split_path, cls)
                        if os.path.isdir(cls_path):
                            images = [f for f in os.listdir(cls_path) 
                                     if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
                            total_images += len(images)
                    print(f"  {split}: {len(classes)} classes, {total_images} images")