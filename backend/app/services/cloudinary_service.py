import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv

load_dotenv()

class CloudinaryService:
    def __init__(self):
        cloudinary.config(
            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
            api_key=os.getenv('CLOUDINARY_API_KEY'),
            api_secret=os.getenv('CLOUDINARY_API_SECRET'),
            secure=True
        )
        self.upload_folder = os.getenv('CLOUDINARY_UPLOAD_FOLDER', 'tomato_guard')
    
    def upload_image(self, file):
        """Upload image to Cloudinary"""
        try:
            upload_result = cloudinary.uploader.upload(
                file,
                folder=self.upload_folder,
                resource_type="image"
            )
            return {
                "public_id": upload_result["public_id"],
                "url": upload_result["secure_url"],
                "format": upload_result["format"],
                "width": upload_result["width"],
                "height": upload_result["height"]
            }
        except Exception as e:
            raise Exception(f"Cloudinary upload failed: {str(e)}")
    
    def get_upload_config(self):
        """Get configuration for frontend upload"""
        return {
            "cloud_name": os.getenv('CLOUDINARY_CLOUD_NAME'),
            "upload_preset": os.getenv('CLOUDINARY_UPLOAD_PRESET', ''),
            "api_key": os.getenv('CLOUDINARY_API_KEY'),
            "folder": self.upload_folder
        }

cloudinary_service = CloudinaryService()