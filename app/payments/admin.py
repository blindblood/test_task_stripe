from django.contrib import admin

from payments.models import Order, Discount, Tax

admin.site.register(Order)
admin.site.register(Discount)
admin.site.register(Tax)
