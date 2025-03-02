// Конфигурация Stripe
const stripePublicKey = document.getElementById('stripe-public-key').content;
const stripe = Stripe(stripePublicKey); 