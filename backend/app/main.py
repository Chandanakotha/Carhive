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

# Set up CORS
# This is crucial for the frontend to talk to the backend
origins = [str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS]
if not origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True if origins != ["*"] else False, # Credentials not allowed with wildcard
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(cars.router, prefix=f"{settings.API_V1_STR}/cars", tags=["Cars"])
app.include_router(bookings.router, prefix=f"{settings.API_V1_STR}/bookings", tags=["Bookings"])
app.include_router(payments.router, prefix=f"{settings.API_V1_STR}/payments", tags=["Payments"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Turo Clone API",
        "docs": "/docs",
        "status": "Running"
    }

# Small TODO: Add custom exception handlers for a cleaner global error response format
