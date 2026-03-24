import os
import shutil
import random
from sklearn.model_selection import train_test_split

def create_part_classifier_dataset(test_size=0.15, val_size=0.15):
    """Create dataset for plant part classifier (leaf/fruit/stem)"""
    source_base = "ml/data/processed"
    target_base = "ml/data/processed_split/part_classifier"
    
    # Map parts to labels (non_tomato will be handled separately)
    parts = ['fruit', 'leaf', 'stem', 'non_tomato']
    
    print("\n🔍 Creating part classifier dataset...")
    print(f"Source: {source_base}")
    print(f"Target: {target_base}")
    print("=" * 50)
    
    # Create base directories for splits
    for split in ['train', 'val', 'test']:
        for part in parts:
            os.makedirs(os.path.join(target_base, split, part), exist_ok=True)
    
    # Process each part
    for part in parts:
        part_source = os.path.join(source_base, part)
        
        if not os.path.exists(part_source):
            print(f"⚠️  Source directory not found: {part_source}")
            continue
        
        print(f"\n📁 Processing: {part}")
        
        # Collect all images from this part
        all_images = []
        
        # Check if part_source has subdirectories (classes) or direct images
        has_subdirs = False
        direct_images = []
        
        for item in os.listdir(part_source):
            item_path = os.path.join(part_source, item)
            if os.path.isdir(item_path):
                has_subdirs = True
                break
            elif item.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                direct_images.append(item)
        
        if has_subdirs:
            # CASE 1: Part has class subdirectories
            for class_name in os.listdir(part_source):
                class_path = os.path.join(part_source, class_name)
                if not os.path.isdir(class_path):
                    continue
                
                # Get all images from this class
                for img_name in os.listdir(class_path):
                    if img_name.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                        img_path = os.path.join(class_path, img_name)
                        all_images.append((img_path, img_name))
        
        elif len(direct_images) > 0:
            # CASE 2: Part has images directly
            for img_name in direct_images:
                img_path = os.path.join(part_source, img_name)
                all_images.append((img_path, img_name))
        
        else:
            print(f"   ⚠️  No images found in {part}")
            continue
        
        print(f"   Found {len(all_images)} total images")
        
        # If too few images, put all in training
        if len(all_images) < 5:
            print(f"   ⚠️  Only {len(all_images)} images. Putting all in training.")
            for img_path, img_name in all_images:
                target_path = os.path.join(target_base, 'train', part, img_name)
                shutil.copy2(img_path, target_path)
            print(f"   {part}: All {len(all_images)} -> train")
            continue
        
        # Split the images
        try:
            # First split: train+val vs test
            train_val, test = train_test_split(
                all_images, 
                test_size=test_size, 
                random_state=42,
                shuffle=True
            )
            
            # Second split: train vs val (from train_val)
            val_ratio = val_size / (1 - test_size)
            train, val = train_test_split(
                train_val, 
                test_size=val_ratio, 
                random_state=42,
                shuffle=True
            )
            
            # Copy images to respective split folders
            for split_name, split_images in [('train', train), ('val', val), ('test', test)]:
                for img_path, img_name in split_images:
                    target_path = os.path.join(target_base, split_name, part, img_name)
                    shutil.copy2(img_path, target_path)
            
            print(f"   {part}: Train={len(train)}, Val={len(val)}, Test={len(test)}")
            
        except Exception as e:
            print(f"   ❌ Error splitting {part}: {str(e)}")
            # Fallback: put all in train
            for img_path, img_name in all_images:
                target_path = os.path.join(target_base, 'train', part, img_name)
                shutil.copy2(img_path, target_path)
            print(f"   {part}: All {len(all_images)} -> train (fallback)")
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 Part Classifier Dataset Summary:")
    print("=" * 50)
    
    for part in parts:
        print(f"\n{part.upper()}:")
        for split in ['train', 'val', 'test']:
            split_path = os.path.join(target_base, split, part)
            if os.path.exists(split_path):
                images = [f for f in os.listdir(split_path) 
                         if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
                print(f"  {split}: {len(images)} images")

if __name__ == "__main__":
    create_part_classifier_dataset()