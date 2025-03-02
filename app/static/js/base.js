document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем корзину при загрузке каждой страницы
    const cart = new Cart();
    cart.updateCartUI();
}); 