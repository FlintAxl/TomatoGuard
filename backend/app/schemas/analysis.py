from pydantic import BaseModel

class ImageUrlRequest(BaseModel):
    url: str