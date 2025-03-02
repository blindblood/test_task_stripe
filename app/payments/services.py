from decimal import Decimal
from django.conf import settings
import stripe
from django.urls import reverse

from .models import Order, OrderItem

stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    @staticmethod
    def create_checkout_session_for_item(item, success_url, cancel_url):
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': item.name,
                            'description': item.description,
                        },
                        'unit_amount': int(item.price * 100),
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
            )

            return session.id,session.url
        except stripe.error.StripeError as e:
            print(f"Stripe error: {str(e)}")
            return None 