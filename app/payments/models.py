# payments/models.py
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

from shop.models import Item


class Order(models.Model):
    """Модель заказа"""
    STATUS_CHOICES = (
        ('pending', 'Pending Payment'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    items = models.ManyToManyField(Item, through='OrderItem')
    discount = models.ForeignKey('Discount', on_delete=models.SET_NULL, null=True, blank=True)
    tax = models.ForeignKey('Tax', on_delete=models.SET_NULL, null=True, blank=True)
    stripe_payment_intent_id = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Order {self.id} ({self.status})"


class Discount(models.Model):
    """Модель скидки"""
    name = models.CharField(max_length=255)
    percent_off = models.IntegerField(validators=[MinValueValidator(0)])
    stripe_coupon_id = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.name} ({self.percent_off}% off)"


class Tax(models.Model):
    """Модель налога"""
    name = models.CharField(max_length=255)
    rate = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(Decimal('0'))])
    stripe_tax_rate_id = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.name} ({self.rate}%)"


class OrderItem(models.Model):
    """Связь Order и Item"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])

    class Meta:
        unique_together = ['order', 'item']

    def __str__(self):
        return f"{self.quantity} {self.item.name}"
