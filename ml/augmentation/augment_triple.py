import os
from PIL import Image

def augment_stem_blight():
    """Create 3 images per original (triple the dataset)"""
    
    # Your specific folder
    input_folder = r"C:\Users\Axl\Desktop\TomatoGuard\ml\data\raw\fruit\anthracnose"
    output_folder = r"C:\Users\Axl\Desktop\TomatoGuard\ml\data\augmented\fruit\anthracnose"
    
    print(f"Augmenting images in: {input_folder}")
    
    # Check if folder exists
    if not os.path.exists(input_folder):
        print(f"❌ Folder not found: {input_folder}")
        return
    
    # Create output folder
    os.makedirs(output_folder, exist_ok=True)
    
    # Get image files
    images = [f for f in os.listdir(input_folder) 
              if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
    
    if not images:
        print("⚠️  No images found!")
        return
    
    print(f"Found {len(images)} images to augment")
    print(f"Will create 3 images per original = {len(images) * 3} total")
    
    for i, filename in enumerate(images, 1):
        try:
            img = Image.open(os.path.join(input_folder, filename))
            base_name = os.path.splitext(filename)[0]
            ext = os.path.splitext(filename)[1]
            
            # OPTION 1: Original + 2 rotations (3 images total)
            # Save original
            img.save(os.path.join(output_folder, f"{base_name}_original{ext}"))
            
            # Save only 2 rotations (90° and 180°)
            rotated_90 = img.rotate(90, expand=True)
            rotated_90.save(os.path.join(output_folder, f"{base_name}_rot90{ext}"))
            
            rotated_180 = img.rotate(180, expand=True)
            rotated_180.save(os.path.join(output_folder, f"{base_name}_rot180{ext}"))
            
            print(f"  ✓ {i}/{len(images)}: {filename} → 3 images")
            
        except Exception as e:
            print(f"  ✗ Error with {filename}: {e}")
    
    print(f"\n✅ Done! Created {len(images) * 3} images in:")
    print(f"   {output_folder}")
    print(f"   Increase: 3x (200% more)")

if __name__ == "__main__":
    augment_stem_blight()