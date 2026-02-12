from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_
from typing import List
from datetime import datetime

from app.db.session import get_db
from app.models.models import Booking, Car, User, BookingStatus, UserRole
from app.schemas.schemas import BookingCreate, BookingInDB
from app.core.dependencies import get_current_active_user

router = APIRouter()

async def check_car_availability(db: AsyncSession, car_id: int, start_date: datetime, end_date: datetime):
    # Check for overlapping bookings that are NOT cancelled
    query = select(Booking).where(
        and_(
            Booking.car_id == car_id,
            Booking.status != BookingStatus.CANCELLED,
            or_(
                and_(Booking.start_date <= start_date, Booking.end_date >= start_date),
                and_(Booking.start_date <= end_date, Booking.end_date >= end_date),
                and_(Booking.start_date >= start_date, Booking.end_date <= end_date)
            )
        )
    )
    result = await db.execute(query)
    overlapping = result.scalars().first()
    return overlapping is None

@router.post("/", response_model=BookingInDB)
async def create_booking(
    booking_in: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # 1. Check if car exists
    result = await db.execute(select(Car).where(Car.id == booking_in.car_id))
    car = result.scalars().first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    if not car.availability_status:
        raise HTTPException(status_code=400, detail="Car is currently not available for rent")

    # 2. Check overlap
    if not await check_car_availability(db, booking_in.car_id, booking_in.start_date, booking_in.end_date):
        raise HTTPException(status_code=400, detail="Car is already booked for these dates")

    # 3. Calculate price
    days = (booking_in.end_date - booking_in.start_date).days
    if days <= 0:
        days = 1 # Minimum 1 day
    total_price = days * car.price_per_day

    # 4. Create booking
    db_booking = Booking(
        customer_id=current_user.id,
        car_id=booking_in.car_id,
        start_date=booking_in.start_date,
        end_date=booking_in.end_date,
        total_price=total_price,
        status=BookingStatus.PENDING
    )
    db.add(db_booking)
    await db.commit()
    await db.refresh(db_booking)
    return db_booking

@router.get("/my", response_model=List[BookingInDB])
async def get_my_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Booking).where(Booking.customer_id == current_user.id))
    return result.scalars().all()

@router.get("/", response_model=List[BookingInDB])
async def list_all_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Only admins can see all bookings
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    result = await db.execute(select(Booking))
    return result.scalars().all()

@router.post("/{booking_id}/cancel", response_model=BookingInDB)
async def cancel_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalars().first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Only owner or admin can cancel
    if booking.customer_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")
    
    booking.status = BookingStatus.CANCELLED
    await db.commit()
    await db.refresh(booking)
    return booking
