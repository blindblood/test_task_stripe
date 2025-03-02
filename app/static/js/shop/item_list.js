document.addEventListener('DOMContentLoaded', function() {
    const cart = new Cart();
    
    function updateButtonState(button, itemId) {
        const cartItem = cart.items[itemId];
        if (cartItem) {
            button.classList.add('in-cart');
            button.innerHTML = `
                <span class="quantity-controls">
                    <button class="qty-btn minus">-</button>
                    <span class="qty-value">${cartItem.quantity}</span>
                    <button class="qty-btn plus">+</button>
                </span>
            `;
        } else {
            button.classList.remove('in-cart');
            button.textContent = 'Add to Cart';
        }
    }

    // Обновляем состояние всех кнопок при загрузке
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        const itemId = button.dataset.itemId;
        updateButtonState(button, itemId);

        button.addEventListener('click', function(e) {
            // Если клик был по кнопкам +/- внутри кнопки
            if (e.target.classList.contains('qty-btn')) {
                e.preventDefault();
                const itemId = this.dataset.itemId;
                const cartItem = cart.items[itemId];
                
                if (e.target.classList.contains('minus')) {
                    if (cartItem.quantity > 1) {
                        cart.updateQuantity(itemId, cartItem.quantity - 1);
                    } else {
                        cart.removeItem(itemId);
                    }
                } else if (e.target.classList.contains('plus')) {
                    cart.updateQuantity(itemId, cartItem.quantity + 1);
                }
                
                updateButtonState(this, itemId);
                return;
            }

            // Обычный клик по кнопке Add to Cart
            const itemData = {
                id: this.dataset.itemId,
                name: this.dataset.itemName,
                price: parseFloat(this.dataset.itemPrice),
                image: this.dataset.itemImage
            };
            
            cart.addItem(itemData);
            updateButtonState(this, itemData.id);
        });
    });
}); 