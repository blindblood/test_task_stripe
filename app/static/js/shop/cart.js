let stripeKey;

class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || {};
        this.taxRate = 0;  // начальное значение
        this.discountRate = 0.1;
        this.appliedCoupon = null;
        
        // Инициализируем налог при создании
        if (window.location.pathname.includes('/cart')) {
            this.initializeTax();
        }
        
        this.initializeEventListeners();
        this.updateCartUI();
    }

    initializeTax() {
        const taxSelect = document.getElementById('tax-select');
        if (taxSelect) {
            // Устанавливаем первый option как выбранный
            if (taxSelect.options.length > 0) {
                taxSelect.selectedIndex = 0;
                this.taxRate = parseFloat(taxSelect.value) / 100;
            }
        }
    }

    // Добавить товар в корзину
    addItem(item) {
        if (this.items[item.id]) {
            this.items[item.id].quantity += 1;
        } else {
            this.items[item.id] = {
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
                image: item.image
            };
        }
        this.saveCart();
        this.updateCartUI();
    }

    // Удалить товар из корзины
    removeItem(itemId) {
        delete this.items[itemId];
        this.saveCart();
        this.updateCartUI();
    }

    // Изменить количество
    updateQuantity(itemId, quantity) {
        if (quantity > 0) {
            this.items[itemId].quantity = quantity;
        } else {
            this.removeItem(itemId);
        }
        this.saveCart();
        this.updateCartUI();

        // Обновляем все кнопки с этим itemId на странице
        document.querySelectorAll(`.add-to-cart-btn[data-item-id="${itemId}"]`).forEach(button => {
            if (quantity > 0) {
                button.classList.add('in-cart');
                button.innerHTML = `
                    <span class="quantity-controls">
                        <button class="qty-btn minus">-</button>
                        <span class="qty-value">${quantity}</span>
                        <button class="qty-btn plus">+</button>
                    </span>
                `;
            } else {
                button.classList.remove('in-cart');
                button.textContent = 'Add to Cart';
            }
        });
    }

    // Сохранить корзину в localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    // Получить общую сумму
    getTotal() {
        return Object.values(this.items).reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Обновить UI корзины
    updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        const headerCartTotal = document.getElementById('cart-total');
        const cartSubtotal = document.getElementById('cart-subtotal');
        const cartDiscount = document.getElementById('cart-discount');
        const cartTax = document.getElementById('cart-tax');
        const summaryTotal = document.getElementById('summary-cart-total');
        const cartItems = document.getElementById('cart-items');

        // Подсчитываем общую сумму
        const subtotal = Object.values(this.items).reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        // Считаем скидку (10%)
        const discount = subtotal * this.discountRate;
        
        // Считаем сумму после скидки
        const afterDiscount = subtotal - discount;

        // Считаем налог от суммы после скидки
        const tax = afterDiscount * this.taxRate;
        
        // Итоговая сумма (сумма после скидки + налог)
        const total = afterDiscount + tax;

        // Обновляем счетчик товаров
        if (cartCount) {
            const itemCount = Object.values(this.items).reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = itemCount;
        }

        // Обновляем суммы
        const totalFormatted = `$${total.toFixed(2)}`;
        
        // Обновляем total в header
        if (headerCartTotal) {
            headerCartTotal.textContent = totalFormatted;
        }

        // Обновляем суммы в корзине
        if (cartSubtotal) {
            cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
            cartDiscount.textContent = `-$${discount.toFixed(2)}`;
            cartTax.textContent = `$${tax.toFixed(2)}`;
        }

        // Обновляем total в summary
        if (summaryTotal) {
            summaryTotal.textContent = totalFormatted;
        }

        // Обновляем список товаров
        if (cartItems) {
            if (Object.keys(this.items).length === 0) {
                cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
                return;
            }

            cartItems.innerHTML = Object.values(this.items).map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <div class="cart-item-price">$${item.price}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus">-</button>
                            <input type="number" value="${item.quantity}" min="1" readonly>
                            <button class="quantity-btn plus">+</button>
                        </div>
                    </div>
                    <div class="cart-item-total">
                        $${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button class="remove-item">×</button>
                </div>
            `).join('');
        }
    }

    // Оформить заказ
    async checkout() {
        try {
            const subtotal = Object.values(this.items).reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);
            
            const discount = subtotal * this.discountRate;
            const afterDiscount = subtotal - discount;
            const tax = afterDiscount * this.taxRate;
            
            const taxSelect = document.getElementById('tax-select');
            const selectedOption = taxSelect.options[taxSelect.selectedIndex];
            const stripeTaxRateId = selectedOption.dataset.stripeTaxRate;

            console.log('Sending data:', {
                items: Object.values(this.items),
                subtotal: subtotal,
                discount_percent: 10,
                tax_id: selectedOption.dataset.id,
                stripe_tax_rate_id: stripeTaxRateId,
                tax_percent: this.taxRate * 100
            });

            const response = await fetch('/create-checkout-session/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken(),
                },
                body: JSON.stringify({
                    items: Object.values(this.items),
                    subtotal: subtotal,
                    discount_percent: 10,
                    tax_id: selectedOption.dataset.id,
                    stripe_tax_rate_id: stripeTaxRateId,
                    tax_percent: this.taxRate * 100
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response data:', data);

            if (data.session_id) {
                const stripe = Stripe(stripeKey);
                const {error} = await stripe.redirectToCheckout({
                    sessionId: data.session_id
                });
                
                if (error) {
                    throw new Error(error.message);
                }
            } else {
                throw new Error('No session ID received: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.error('Detailed error:', error);
            alert(`Error: ${error.message}`);
        }
    }

    getCSRFToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]').value;
        console.log('CSRF Token:', token);  // Проверяем, получили ли токен
        return token;
    }

    initializeEventListeners() {
        const cartItems = document.getElementById('cart-items');
        if (cartItems) {
            cartItems.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                if (!cartItem) return;
                
                const itemId = cartItem.dataset.id;
                
                if (e.target.classList.contains('minus')) {
                    const currentQty = this.items[itemId].quantity;
                    this.updateQuantity(itemId, currentQty - 1);
                }
                else if (e.target.classList.contains('plus')) {
                    const currentQty = this.items[itemId].quantity;
                    this.updateQuantity(itemId, currentQty + 1);
                }
                else if (e.target.classList.contains('remove-item')) {
                    this.removeItem(itemId);
                }
            });
        }

        const checkoutButton = document.getElementById('checkout-button');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => {
                this.checkout();
            });
        }

        // Обновляем обработчик выбора налога
        const taxSelect = document.getElementById('tax-select');
        if (taxSelect) {
            taxSelect.addEventListener('change', (e) => {
                this.taxRate = parseFloat(e.target.value) / 100;
                this.updateCartUI();
            });
        }

        // Добавляем обработчик для кнопки применения купона
        const applyButton = document.getElementById('apply-coupon');
        console.log('Apply button:', applyButton); // Проверяем, находит ли кнопку

        if (applyButton) {
            applyButton.addEventListener('click', () => {
                console.log('Apply button clicked'); // Проверяем, срабатывает ли клик
                this.applyCoupon();
            });
        }
    }

    async applyCoupon() {
        const couponInput = document.getElementById('coupon-code');
        const couponMessage = document.getElementById('coupon-message');
        const couponCode = couponInput.value.trim();

        if (!couponCode) {
            couponMessage.textContent = 'Please enter a discount code';
            couponMessage.style.color = 'red';
            return;
        }

        try {
            const response = await fetch('/verify-discount/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken(),
                },
                body: JSON.stringify({ coupon_code: couponCode })
            });

            const data = await response.json();

            if (data.valid) {
                // Применяем новую скидку
                this.appliedCoupon = {
                    code: couponCode,
                    discount: data.discount_rate
                };
                this.discountRate = data.discount_rate / 100;
                couponMessage.textContent = 'Discount code applied successfully!';
                couponMessage.style.color = 'green';
                document.getElementById('discount-row').style.display = 'flex';
            } else {
                // Сбрасываем скидку при неверном коде
                this.appliedCoupon = null;
                this.discountRate = 0;  // Убираем скидку
                couponMessage.textContent = 'Invalid discount code';
                couponMessage.style.color = 'red';
                document.getElementById('discount-row').style.display = 'none';
            }
            
            // В любом случае обновляем UI
            this.updateCartUI();
            
        } catch (error) {
            console.error('Error applying discount:', error);
            // При ошибке тоже сбрасываем скидку
            this.appliedCoupon = null;
            this.discountRate = 0;
            couponMessage.textContent = 'Error applying discount code';
            couponMessage.style.color = 'red';
            document.getElementById('discount-row').style.display = 'none';
            this.updateCartUI();
        }
    }
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Получаем Stripe ключ
    const scriptTag = document.querySelector('script[data-stripe-key]');
    if (scriptTag) {
        stripeKey = scriptTag.getAttribute('data-stripe-key');
    }

    // Создаем экземпляр корзины
    const cart = new Cart();
    
    // Принудительно пересчитываем при загрузке страницы корзины
    if (window.location.pathname.includes('/cart')) {
        cart.initializeTax();  // Переинициализируем налог
        cart.updateCartUI();   // Обновляем UI
    }
}); 
