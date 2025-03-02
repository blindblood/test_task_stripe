# payments/urls.py
from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('buy/<int:id>/', views.create_checkout_session, name='create-checkout-session'),
    path('success/', views.payment_success, name='success'),
    path('cancel/', views.payment_cancel, name='cancel'),
    path('create-checkout-session/', views.create_checkout_session, name='create-checkout-session'),
    path('verify-discount/', views.verify_discount, name='verify_discount'),
]
