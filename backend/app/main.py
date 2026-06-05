from app.db.session import engine, Base
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, cars, bookings, payments
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="A professional, interview-ready Turo clone backend.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS setup
origins = [str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS]

if not origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True if origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["Authentication"]
)

app.include_router(
    cars.router,
    prefix=f"{settings.API_V1_STR}/cars",
    tags=["Cars"]
)

app.include_router(
    bookings.router,
    prefix=f"{settings.API_V1_STR}/bookings",
    tags=["Bookings"]
)

app.include_router(
    payments.router,
    prefix=f"{settings.API_V1_STR}/payments",
    tags=["Payments"]
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to the Turo Clone API",
        "docs": "/docs",
        "status": "Running"
    }


@app.on_event("startup")
async def on_startup():
    try:
        print("Starting app...")

        async with engine.begin() as conn:
            print("Connected to database...")

            await conn.run_sync(Base.metadata.create_all)

            print("Database tables created successfully.")

    except Exception as e:
        print(f"Startup Error: {e}")
        raise e


@app.on_event("shutdown")
async def on_shutdown():
    await engine.dispose()
    print("Database connection closed.")
