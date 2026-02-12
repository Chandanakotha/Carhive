from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from app.models.models import UserRole, BookingStatus

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.CLIENT

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None

class UserInDB(UserBase):
    id: int
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# --- Car Schemas ---
class CarBase(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    location: str
    price_per_day: float
    availability_status: bool = True
    description: Optional[str] = None
    
    # New fields
    name: Optional[str] = None
    photo: Optional[str] = None
    car_type: Optional[str] = None
    seaters: Optional[int] = None
    price_type: Optional[str] = "day"
    features: Optional[str] = None
    contact: Optional[str] = None
    host: Optional[str] = None

class CarCreate(CarBase):
    pass

class CarUpdate(CarBase):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    location: Optional[str] = None
    price_per_day: Optional[float] = None

class UserPublic(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None

class CarInDB(CarBase):
    id: int
    owner_id: int
    owner: Optional[UserPublic] = None

    class Config:
        from_attributes = True

# --- Booking Schemas ---
class BookingBase(BaseModel):
    car_id: int
    start_date: datetime
    end_date: datetime

class BookingCreate(BookingBase):
    pass

class BookingInDB(BookingBase):
    id: int
    customer_id: int
    total_price: float
    status: BookingStatus
    created_at: datetime

    class Config:
        from_attributes = True
