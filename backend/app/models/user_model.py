from datetime import datetime
from typing import Optional, Annotated, Any
from enum import Enum
from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, ConfigDict, BeforeValidator, field_validator
from pydantic_core import core_schema


# Custom ObjectId handler for Pydantic V2
def validate_object_id(v: Any) -> ObjectId:
    if isinstance(v, ObjectId):
        return v
    if isinstance(v, str) and ObjectId.is_valid(v):
        return ObjectId(v)
    raise ValueError("Invalid ObjectId")


PyObjectId = Annotated[ObjectId, BeforeValidator(validate_object_id)]

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class UserInDB(BaseModel):
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    email: EmailStr
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None
    hashed_password: str
    is_active: bool = True
    role: UserRole = UserRole.USER
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Pydantic V2 config
    model_config = ConfigDict(
        populate_by_name=True,  # Replaces allow_population_by_field_name
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )
    
    @field_validator('id', mode='before')
    @classmethod
    def validate_id(cls, v):
        if v is None:
            return ObjectId()
        return v