class OrderManager {
    constructor() {
        this.orderItems = document.querySelector('.order-items');
        this.checkoutButton = document.getElementById('checkout-button');
        this.bindEvents();
    }

    bindEvents() {
        this.orderItems.addEventListener('click', (e) => {
            const target = e.target;
            const item = target.closest('.order-item');
            
            if (!item) return;
            
            const itemId = item.dataset.itemId;

            if (target.classList.contains('increase')) {
                this.updateQuantity(itemId, 1);
            } else if (target.classList.contains('decrease')) {
                this.updateQuantity(itemId, -1);
            } else if (target.classList.contains('remove-item')) {
                this.removeItem(itemId);
            }
        });

        this.checkoutButton.addEventListener('click', () => this.proceedToCheckout());
    }

    async updateQuantity(itemId, change) {
        const item = document.querySelector(`.order-item[data-item-id="${itemId}"]`);
        const input = item.querySelector('input');
        const newQuantity = parseInt(input.value) + change;

        if (newQuantity < 1) return;

        try {
            const response = await fetch(`/api/payments/order/update-item/${itemId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken(),
                },
                body: JSON.stringify({ quantity: newQuantity }),
            });

            if (response.ok) {
                const data = await response.json();
                input.value = newQuantity;
                this.updateOrderSummary(data);
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    }

    async removeItem(itemId) {
        try {
            const response = await fetch(`/api/payments/order/remove-item/${itemId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCsrfToken(),
                },
            });

            if (response.ok) {
                const item = document.querySelector(`.order-item[data-item-id="${itemId}"]`);
                item.remove();
                const data = await response.json();
                this.updateOrderSummary(data);
            }
        } catch (error) {
            console.error('Error removing item:', error);
        }
    }

    getCsrfToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }

    updateOrderSummary(data) {
        document.querySelector('.subtotal span:last-child').textContent = data.subtotal;
        document.querySelector('.total span:last-child').textContent = data.total;
    }

    async proceedToCheckout() {
        try {
            const response = await fetch('/api/payments/create-checkout-session/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCsrfToken(),
                },
            });

            const data = await response.json();
            
            if (data.session_id) {
                const stripe = Stripe(data.stripe_public_key);
                stripe.redirectToCheckout({
                    sessionId: data.session_id
                });
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OrderManager();
}); 