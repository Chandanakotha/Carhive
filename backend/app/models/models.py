from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.db.session import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    DEALER = "DEALER"
    CLIENT = "CLIENT"

class BookingStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.CLIENT)
    is_active = Column(Boolean, default=True)

    bookings = relationship("Booking", back_populates="customer")
    cars = relationship("Car", back_populates="owner")

class Car(Base):
    __tablename__ = "cars"

    id = Column(Integer, primary_key=True, index=True)
    make = Column(String, nullable=True)
    model = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    location = Column(String, nullable=False)
    price_per_day = Column(Float, nullable=False)
    availability_status = Column(Boolean, default=True, server_default="true")
    description = Column(String)
    
    # New fields for frontend compatibility
    name = Column(String, nullable=True)
    photo = Column(String, nullable=True) # Base64 or URL
    car_type = Column(String, nullable=True)
    seaters = Column(Integer, nullable=True)
    price_type = Column(String, default="day")
    features = Column(String, nullable=True)
    contact = Column(String, nullable=True)
    host = Column(String, nullable=True) # Explicit host name for demo
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="cars")
    bookings = relationship("Booking", back_populates="car")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"))
    car_id = Column(Integer, ForeignKey("cars.id"))
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("User", back_populates="bookings")
    car = relationship("Car", back_populates="bookings")
