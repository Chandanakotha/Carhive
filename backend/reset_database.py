import asyncio
import sys
import os

# Create relative path
sys.path.append(os.getcwd())

from app.db.session import engine, Base
from app.models.models import User, Car, Booking  # Import all models to register them
from sqlalchemy.schema import CreateTable

async def reset_db():
    print("Connecting to database...")
    async with engine.begin() as conn:
        print("Dropping all tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)
        
    print("Seeding demo data...")
    async with engine.begin() as conn:
        from sqlalchemy import text
        # Insert admin user
        await conn.execute(text("INSERT INTO users (email, hashed_password, full_name, role, is_active) VALUES ('demo@example.com', 'hashed_pw', 'CarHive Admin', 'ADMIN', true)"))
        
        # Insert Discovery Cars
        cars = [
            ("Jeep Gladiator 2023", "Mumbai, Maharashtra", 4500.0, "SUV", 5, "day", "4WD, Leather Seats, Convertible, Premium Audio", "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80", 1),
            ("Toyota Camry 2024", "Delhi, NCR", 3200.0, "Sedan", 5, "day", "Hybrid, Sunroof, Lane Assist, Apple CarPlay", "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80", 1),
            ("Tesla Model 3 2023", "Bangalore, Karnataka", 6000.0, "Electric", 5, "day", "Autopilot, Glass Roof, Heated Seats, Fast Charging", "https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=800&q=80", 1),
            ("Porsche 911 Carrera", "Hyderabad, Telangana", 15000.0, "Luxury", 2, "day", "Sport Mode, Bose Sound, Turbocharged, Premium Leather", "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80", 1)
        ]
        
        for car in cars:
            await conn.execute(text("INSERT INTO cars (name, location, price_per_day, car_type, seaters, price_type, features, photo, owner_id, availability_status) VALUES (:name, :location, :price_per_day, :car_type, :seaters, :price_type, :features, :photo, :owner_id, true)"), 
                {"name": car[0], "location": car[1], "price_per_day": car[2], "car_type": car[3], "seaters": car[4], "price_type": car[5], "features": car[6], "photo": car[7], "owner_id": car[8]})

    print("Database reset and seeded with demo data successfully!")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(reset_db())
