from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.models import Booking, BookingStatus, User
from app.core.dependencies import get_current_active_user

router = APIRouter()

from app.services.stripe_service import stripe_service

router = APIRouter()

# In a real app, this would handle webhooks. 
# For now, we simulate the "Pay" action using our service layer.

async def send_confirmation_email(email: str, booking_id: int):
    # Simulated background task
    print(f"SIMULATION: Sending confirmation email to {email} for booking {booking_id}")

@router.post("/{booking_id}/pay")
async def process_payment(
    booking_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalars().first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if booking.status != BookingStatus.PENDING:
        raise HTTPException(status_code=400, detail="Booking is not in a pending state")

    # Use our service layer for the "Stripe" call
    payment_intent = await stripe_service.create_payment_intent(booking.total_price)
    capture = await stripe_service.capture_payment(payment_intent["id"])

    if capture["status"] == "succeeded":
        booking.status = BookingStatus.CONFIRMED
        await db.commit()
        
        # Add a background task for "email"
        background_tasks.add_task(send_confirmation_email, current_user.email, booking.id)
        
        return {"status": "Payment successful", "booking_id": booking.id, "transaction_id": capture["id"]}
    
    raise HTTPException(status_code=400, detail="Payment failed at processor")
