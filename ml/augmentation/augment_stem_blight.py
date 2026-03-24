import os
from PIL import Image

def augment_stem_blight():
    """Only augment stem/blight images"""
    
    # Your specific folder
    input_folder = r"C:\Users\Axl\Desktop\TomatoGuard\ml\data\raw\fruit\bortrytis_gray_mold"
    output_folder = r"C:\Users\Axl\Desktop\TomatoGuard\ml\data\augmented\fruit\bortrytis_gray_mold"
    
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
    
    for i, filename in enumerate(images, 1):
        try:
            img = Image.open(os.path.join(input_folder, filename))
            base_name = os.path.splitext(filename)[0]
            ext = os.path.splitext(filename)[1]
            
            # Save all 6 versions
            img.save(os.path.join(output_folder, f"{base_name}_original{ext}"))
            
            for angle in [90, 180, 270]:
                rotated = img.rotate(angle, expand=True)
                rotated.save(os.path.join(output_folder, f"{base_name}_rot{angle}{ext}"))
            
            img.transpose(Image.FLIP_LEFT_RIGHT).save(
                os.path.join(output_folder, f"{base_name}_flipH{ext}"))
            img.transpose(Image.FLIP_TOP_BOTTOM).save(
                os.path.join(output_folder, f"{base_name}_flipV{ext}"))
            
            print(f"  ✓ {i}/{len(images)}: {filename} → 6 images")
            
        except Exception as e:
            print(f"  ✗ Error with {filename}: {e}")
    
    print(f"\n✅ Done! Created {len(images) * 6} images in:")
    print(f"   {output_folder}")

if __name__ == "__main__":
    augment_stem_blight()