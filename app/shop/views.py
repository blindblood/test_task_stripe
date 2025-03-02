from django.shortcuts import render, get_object_or_404
from shop.models import Item
from payments.models import Item as PaymentItem, Tax
from django.conf import settings

# Create your views here.

def item_list(request):
    items = Item.objects.all()
    return render(request, 'shop/item_list.html', {
        'items': items
    })

def cart_view(request):
    # Предполагаем, что у вас есть модель Tax
    tax_rates = Tax.objects.all()
    context = {
        'tax_rates': tax_rates,
        'stripe_key': settings.STRIPE_PUBLIC_KEY,
    }
    return render(request, 'shop/cart.html', context)

def item_detail(request, id):
    item = get_object_or_404(Item, id=id)
    return render(request, 'shop/item_detail.html', {
        'item': item
    })
