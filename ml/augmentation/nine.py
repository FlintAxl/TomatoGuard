import os
from PIL import Image

def augment_stem_blight():
    """Only augment stem/blight images"""
    
    # Your specific folder
    input_folder = r"C:\Users\Axl\Desktop\TomatoGuard\ml\data\raw\leaf\bacterial_spot"
    output_folder = r"C:\Users\Axl\Desktop\TomatoGuard\ml\data\augmented\bacterial"
    
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
            
            # Save original
            img.save(os.path.join(output_folder, f"{base_name}_original{ext}"))
            
            # Rotations (3 images)
            for angle in [90, 180, 270]:
                rotated = img.rotate(angle, expand=True)
                rotated.save(os.path.join(output_folder, f"{base_name}_rot{angle}{ext}"))
            
            # Flips (2 images)
            img.transpose(Image.FLIP_LEFT_RIGHT).save(
                os.path.join(output_folder, f"{base_name}_flipH{ext}"))
            img.transpose(Image.FLIP_TOP_BOTTOM).save(
                os.path.join(output_folder, f"{base_name}_flipV{ext}"))
            
            # Brightness variations (3 images)
            from PIL import ImageEnhance
            
            # Increase brightness
            enhancer = ImageEnhance.Brightness(img)
            bright_img = enhancer.enhance(1.3)  # 30% brighter
            bright_img.save(os.path.join(output_folder, f"{base_name}_bright{ext}"))
            
            # Decrease brightness
            dark_img = enhancer.enhance(0.7)  # 30% darker
            dark_img.save(os.path.join(output_folder, f"{base_name}_dark{ext}"))
            
            # Increase contrast
            contrast_enhancer = ImageEnhance.Contrast(img)
            contrast_img = contrast_enhancer.enhance(1.5)  # 50% more contrast
            contrast_img.save(os.path.join(output_folder, f"{base_name}_contrast{ext}"))
            
            print(f"  ✓ {i}/{len(images)}: {filename} → 9 images")
            
        except Exception as e:
            print(f"  ✗ Error with {filename}: {e}")
    
    print(f"\n✅ Done! Created {len(images) * 9} images in:")
    print(f"   {output_folder}")

if __name__ == "__main__":
    augment_stem_blight()