import stripe


stripe.api_key = 'sk_test_51QwKuWE0xz0kvh1qxxWfDEXCW2ORUb5krGK1eZFk2bAV2kZAkiUUSJnD5U4UUafBYEZJ9v3azxaYxWUnf4PHYVJP00YTeNLgyV'


class StripeService:
    @staticmethod
    def get_products():
        """Получает список всех продуктов из Stripe"""
        try:
            # Получаем список всех активных продуктов
            products = stripe.Product.list(
                active=True,
                limit=100,
                expand=['data.default_price']
            )

            formatted_products = []
            for product in products.data:
                price = product.default_price
                formatted_products.append({
                    'id': product.id,
                    'name': product.name,
                    'description': product.description,
                    'price': price.unit_amount / 100 if price else None,  # конвертируем центы в доллары
                    'currency': price.currency if price else None,
                    'image': product.images[0] if product.images else None,
                })
            print(formatted_products)
            return formatted_products

        except stripe.error.StripeError as e:
            # Обработка ошибок Stripe
            print(f"Stripe error: {str(e)}")
            return []
        except Exception as e:
            # Обработка других ошибок
            print(f"Error: {str(e)}")
            return []

    @staticmethod
    def get_product(product_id):
        """Получает конкретный продукт из Stripe по ID"""
        try:
            product = stripe.Product.retrieve(
                product_id,
                expand=['default_price']
            )

            price = product.default_price
            return {
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'price': price.unit_amount / 100 if price else None,
                'currency': price.currency if price else None,
                'image': product.images[0] if product.images else None,
            }

        except stripe.error.StripeError as e:
            print(f"Stripe error: {str(e)}")
            return None


StripeService.get_products()