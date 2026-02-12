from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from typing import List, Optional

from app.db.session import get_db
from app.models.models import Car, User, UserRole
from app.schemas.schemas import CarCreate, CarUpdate, CarInDB
from app.core.dependencies import check_admin, get_current_active_user

router = APIRouter()

from sqlalchemy.orm import selectinload

@router.get("/", response_model=List[CarInDB])
async def list_cars(
    db: AsyncSession = Depends(get_db),
    location: Optional[str] = None,
    make: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    skip: int = 0,
    limit: int = 20,
):
    query = select(Car).options(selectinload(Car.owner))
    filters = []
    if location:
        filters.append(Car.location.ilike(f"%{location}%"))
    if make:
        filters.append(Car.make.ilike(f"%{make}%"))
    if min_price is not None:
        filters.append(Car.price_per_day >= min_price)
    if max_price is not None:
        filters.append(Car.price_per_day <= max_price)
    
    if filters:
        query = query.where(and_(*filters))
    
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/my", response_model=List[CarInDB])
async def list_my_cars(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Car).where(Car.owner_id == current_user.id).options(selectinload(Car.owner)))
    return result.scalars().all()

@router.get("/{car_id}", response_model=CarInDB)
async def get_car(car_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Car).where(Car.id == car_id).options(selectinload(Car.owner)))
    car = result.scalars().first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return car

@router.post("/", response_model=CarInDB)
async def create_car(
    car_in: CarCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user)
):
    # Use current user if logged in, otherwise fallback to first user for demo
    owner_id = 1
    if current_user:
        owner_id = current_user.id
    else:
        user_result = await db.execute(select(User).limit(1))
        owner = user_result.scalars().first()
        if owner:
            owner_id = owner.id

    db_car = Car(**car_in.model_dump(), owner_id=owner_id)
    db.add(db_car)
    await db.commit()
    
    # Reload with owner relationship
    result = await db.execute(
        select(Car).where(Car.id == db_car.id).options(selectinload(Car.owner))
    )
    db_car = result.scalars().first()
    return db_car

@router.put("/{car_id}", response_model=CarInDB)
async def update_car(
    car_id: int,
    car_in: CarUpdate,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Car).where(Car.id == car_id))
    db_car = result.scalars().first()
    if not db_car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    update_data = car_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_car, field, value)
    
    await db.commit()
    
    # Reload with owner relationship to avoid MissingGreenlet error in response model
    result = await db.execute(
        select(Car).where(Car.id == db_car.id).options(selectinload(Car.owner))
    )
    db_car = result.scalars().first()
    return db_car

@router.delete("/{car_id}")
async def delete_car(
    car_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Car).where(Car.id == car_id))
    db_car = result.scalars().first()
    if not db_car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    await db.delete(db_car)
    await db.commit()
    return {"detail": "Car deleted"}
