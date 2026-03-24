import os
from PIL import Image

def augment_double():
    """Create 2 images per original (double the dataset) for anthracnose"""
    
    # Your anthracnose folder
    input_folder = r"C:\Users\Axl\Desktop\TomatoGuard\ml\data\raw\hello"
    output_folder = r"C:\Users\Axl\Desktop\TomatoGuard\ml\data\augmented\hello_double"
    
    print(f"Doubling anthracnose dataset from: {input_folder}")
    
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
    
    print(f"Found {len(images)} images (currently {len(images)} images)")
    print(f"Goal: Create 2 images per original = {len(images) * 2} total")
    
    for i, filename in enumerate(images, 1):
        try:
            img = Image.open(os.path.join(input_folder, filename))
            base_name = os.path.splitext(filename)[0]
            ext = os.path.splitext(filename)[1]
            
            # OPTION A: Original + 90° rotation (2 images total)
            # 1. Save original
            img.save(os.path.join(output_folder, f"{base_name}_original{ext}"))
            
            # 2. Save 90° rotation only
            rotated_90 = img.rotate(90, expand=True)
            rotated_90.save(os.path.join(output_folder, f"{base_name}_rot90{ext}"))
            
            # OPTION B: Original + horizontal flip (2 images total)
            # Uncomment if you prefer this:
            # img.save(os.path.join(output_folder, f"{base_name}_original{ext}"))
            # flipped = img.transpose(Image.FLIP_LEFT_RIGHT)
            # flipped.save(os.path.join(output_folder, f"{base_name}_flipH{ext}"))
            
            print(f"  ✓ {i}/{len(images)}: {filename} → 2 images")
            
        except Exception as e:
            print(f"  ✗ Error with {filename}: {e}")
    
    original_count = len(images)
    new_count = original_count * 2
    print(f"\n✅ Dataset doubled!")
    print(f"   Original: {original_count} images")
    print(f"   New total: {new_count} images")
    print(f"   Increase: 2x (100% more)")
    print(f"\n📍 Saved to: {output_folder}")

if __name__ == "__main__":
    augment_double()