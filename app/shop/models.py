from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Item(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    image = models.ImageField(upload_to='items/', blank=True, )
    stripe_product_id = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.name} - {self.price}"
