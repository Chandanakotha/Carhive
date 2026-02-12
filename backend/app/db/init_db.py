import asyncio
from app.db.session import engine, Base, SessionLocal
from app.models.models import User, Car, UserRole
from app.core.security import get_password_hash

async def init_db():
    async with engine.begin() as conn:
        # Drop all tables and recreate to ensure schema consistency
        # WARNING: This deletes all data. Ideal for development/resetting.
        print("Dropping existing tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating fresh tables...")
        await conn.run_sync(Base.metadata.create_all)
    
    # Seed data
    async with SessionLocal() as db:
        # 1. Create default admin and dealer if not exists
        from sqlalchemy import select
        
        # Admin
        result = await db.execute(select(User).where(User.email == "admin@turo.com"))
        if not result.scalars().first():
            admin_user = User(
                email="admin@turo.com",
                hashed_password=get_password_hash("admin123"),
                full_name="System Admin",
                role=UserRole.ADMIN
            )
            db.add(admin_user)
            print("Admin user created (admin@turo.com / admin123)")

        # Dealer
        dealer_result = await db.execute(select(User).where(User.email == "dealer@turo.com"))
        dealer = dealer_result.scalars().first()
        if not dealer:
            dealer = User(
                email="dealer@turo.com",
                hashed_password=get_password_hash("dealer123"),
                full_name="Premium Dealer",
                role=UserRole.DEALER
            )
            db.add(dealer)
            await db.flush() # Get the ID
            print("Dealer user created (dealer@turo.com / dealer123)")

        # 2. Create sample cars
        car_result = await db.execute(select(Car))
        if not car_result.scalars().first():
            sample_cars = [
                Car(make="Maruti Suzuki", model="Swift", year=2023, location="Mumbai", price_per_day=2500, description="Compact and efficient for city drives.", owner_id=dealer.id),
                Car(make="Mahindra", model="XUV700", year=2022, location="Delhi", price_per_day=5500, description="Premium SUV with advanced features.", owner_id=dealer.id),
                Car(make="Tata", model="Nexon EV", year=2023, location="Bangalore", price_per_day=4000, description="Clean electric driving in the city.", owner_id=dealer.id)
            ]
            db.add_all(sample_cars)
            print("Sample cars added (Owned by Dealer).")
        
        await db.commit()

    print("Database initialization and seeding complete!")

if __name__ == "__main__":
    asyncio.run(init_db())
