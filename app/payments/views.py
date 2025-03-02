from django.shortcuts import render
import stripe

from rest_framework.decorators import api_view
from django.urls import reverse
from rest_framework.response import Response

from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json
from django.utils import timezone

from payments.models import Discount

stripe.api_key = settings.STRIPE_SECRET_KEY

@api_view(['POST'])
def create_checkout_session(request):
    try:
        data = request.data
        items = data.get('items', [])
        stripe_tax_rate_id = data.get('stripe_tax_rate_id', 0)


        success_url = request.build_absolute_uri(reverse('payments:success'))
        cancel_url = request.build_absolute_uri(reverse('payments:cancel'))

        # Создаем сессию Stripe
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': item['name'],
                        'description': f"Quantity: {item['quantity']}",
                        'images': [request.build_absolute_uri(item['image'])] if item.get('image') else [],
                    },
                    'unit_amount': int((float(item['price'])) * 100),
                },
                'quantity': item['quantity'],
                'tax_rates': [stripe_tax_rate_id],

            } for item in items],
            discounts=[{
                'coupon': "cJIoflLI",
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,

        )

        return Response({'session_id': session.id})
    
    except Exception as e:
        print(f"Error in create_checkout_session: {str(e)}")
        return Response({'error': str(e)}, status=400)


def payment_success(request):
    return render(request, 'payments/success.html')

def payment_cancel(request):
    return render(request, 'payments/cancel.html')

@api_view(['POST'])
def verify_discount(request):
    try:
        data = request.data
        discount_code = data.get('coupon_code')
        
        try:
            discount = Discount.objects.get(
                name=discount_code,
            )
            return Response({
                'valid': True,
                'discount_rate': float(discount.percent_off)
            })
        except Discount.DoesNotExist:
            return Response({'valid': False})
                
    except Exception as e:
        print(f"Error in verify_discount: {str(e)}")
        return Response({'error': str(e)}, status=400)

