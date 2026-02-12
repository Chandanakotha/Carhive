import asyncio
from app.core.config import settings

class StripeService:
    def __init__(self):
        self.api_key = settings.STRIPE_API_KEY

    async def create_payment_intent(self, amount: float, currency: str = "usd"):
        """
        Simulates creating a Stripe Payment Intent.
        In production, this would call stripe.PaymentIntent.create()
        """
        # Realistic simulation of network latency
        await asyncio.sleep(0.5)
        
        # In a real app, we'd return the client_secret
        return {
            "id": f"pi_sim_{int(asyncio.get_event_loop().time())}",
            "amount": amount,
            "status": "requires_payment_method",
            "client_secret": "sim_client_secret_123"
        }

    async def capture_payment(self, payment_intent_id: str):
        """
        Simulates capturing or confirming a payment.
        """
        await asyncio.sleep(0.3)
        # TODO: Handle edge cases like insufficient funds or expired cards
        return {"status": "succeeded", "id": payment_intent_id}

# Singleton instance for the app
stripe_service = StripeService()
