
import click
from api.models import db, User, Category, Product

"""
In this file, you can add as many commands as you want using the @app.cli.command decorator
Flask commands are usefull to run cronjobs or tasks outside of the API but sill in integration 
with youy database, for example: Import the price of bitcoin every night as 12am
"""


def setup_commands(app):
    """ 
    This is an example command "insert-test-users" that you can run from the command line
    by typing: $ flask insert-test-users 5
    Note: 5 is the number of users to add
    """
    @app.cli.command("insert-test-users")  # name of our command
    @click.argument("count")  # argument of out command
    def insert_test_users(count):
        print("Creating test users")
        for x in range(1, int(count) + 1):
            user = User()
            user.email = "test_user" + str(x) + "@test.com"
            user.first_name = f"Usuario{x}"
            user.last_name = "Prueba"
            user.set_password("123456")
            user.is_active = True
            db.session.add(user)
            db.session.commit()
            print("User: ", user.email, " created.")

        print("All test users created")

    @app.cli.command("create-sample-data")
    def create_sample_data():
        """Crear datos de prueba para la tienda"""
        print("Creating sample data...")

        # Crear categorías
        categories_data = [
            {'name': 'Amigurumis', 'description': 'Muñecos y figuras tejidas a crochet'},
            {'name': 'Ropa', 'description': 'Prendas de vestir hechas a crochet'},
            {'name': 'Accesorios', 'description': 'Bolsos, carteras y accesorios'},
            {'name': 'Decoración', 'description': 'Elementos decorativos para el hogar'}
        ]

        products_data = [
            {
                'name': 'Alfombra Circular',
                'description': 'Alfombra tejida a mano, perfecta para decorar cualquier espacio.',
                'price': 40.00,
                'stock': 5,
                'category_id': 4,
                'image_url': 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&w=500'
            },
            {
                'name': 'Portavasos Crochet',
                'description': 'Set de 4 portavasos tejidos, ideales para proteger tus muebles.',
                'price': 12.00,
                'stock': 25,
                'category_id': 3,
                'image_url': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?ixlib=rb-4.0.3&w=500'
            },
            {
                'name': 'Muñeca Amigurumi',
                'description': 'Muñeca tejida con detalles personalizados, perfecta para regalar.',
                'price': 35.50,
                'stock': 7,
                'category_id': 1,
                'image_url': 'https://images.unsplash.com/photo-1529927066849-79b791a69825?ixlib=rb-4.0.3&w=500'
            },
            {
                'name': 'Cesta Organizadora',
                'description': 'Cesta tejida para organizar objetos pequeños en tu hogar.',
                'price': 20.00,
                'stock': 10,
                'category_id': 2,
                'image_url': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?ixlib=rb-4.0.3&w=500'
            },
            {
                'name': 'Osito de Peluche',
                'description': 'Adorable osito tejido a mano con hilo suave. Perfecto para bebés y niños.',
                'price': 25.99,
                'stock': 10,
                'category_id': 1,
                'image_url': 'https://images.unsplash.com/photo-1529927066849-79b791a69825?ixlib=rb-4.0.3&w=500'
            },
            {
                'name': 'Bufanda Multicolor',
                'description': 'Bufanda tejida con colores vibrantes, ideal para días fríos.',
                'price': 18.50,
                'stock': 15,
                'category_id': 2,
                'image_url': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?ixlib=rb-4.0.3&w=500'
            },
            {
                'name': 'Bolso de Playa',
                'description': 'Bolso espacioso y resistente, perfecto para llevar a la playa.',
                'price': 32.00,
                'stock': 8,
                'category_id': 3,
                'image_url': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?ixlib=rb-4.0.3&w=500'
            },
            {
                'name': 'Cojín Decorativo',
                'description': 'Hermoso cojín con patrones geométricos para decorar tu sofá.',
                'price': 22.75,
                'stock': 12,
                'category_id': 4,
                'image_url': 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&w=500'
            },
            {
                'name': 'Unicornio Mágico',
                'description': 'Unicornio colorido con cuerno dorado y cola de arcoíris.',
                'price': 28.99,
                'stock': 6,
                'category_id': 1,
                'image_url': 'https://images.unsplash.com/photo-1529927066849-79b791a69825?ixlib=rb-4.0.3&w=500'
            },
            {
                'name': 'Gorro de Invierno',
                'description': 'Gorro cálido con pompón, disponible en varios colores.',
                'price': 15.00,
                'stock': 20,
                'category_id': 2,
                'image_url': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?ixlib=rb-4.0.3&w=500'
            }
        ]

        categories = []
        for cat_data in categories_data:
            category = Category(
                name=cat_data['name'], description=cat_data['description'])
            db.session.add(category)
            categories.append(category)

        db.session.commit()
        print(f"✅ Created {len(categories)} categories")

        # Crear productos
        products_data = [
            {
                'name': 'Osito de Peluche',
                'description': 'Adorable osito tejido a mano con hilo suave. Perfecto para bebés y niños.',
                'price': 25.99,
                'stock': 10,
                'category_id': 1,
                'image_url': 'https://images.unsplash.com/photo-1529927066849-79b791a69825?ixlib=rb-4.0.3&w=500'
            },
            {
                'name': 'Bufanda Multicolor',
                'description': 'Bufanda tejida con colores vibrantes, ideal para días fríos.',
                'price': 18.50,
                'stock': 15,
                'category_id': 2,
                'image_url': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?ixlib=rb-4.0.3&w=500'
            },
            {
                'name': 'Bolso de Playa',
                'description': 'Bolso espacioso y resistente, perfecto para llevar a la playa.',
                'price': 32.00,
                'stock': 8,
                'category_id': 3,
                'image_url': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?ixlib=rb-4.0.3&w=500'
            },
            {
                'name': 'Cojín Decorativo',
                'description': 'Hermoso cojín con patrones geométricos para decorar tu sofá.',
                'price': 22.75,
                'stock': 12,
                'category_id': 4,
                'image_url': 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&w=500'
            },
            {
                'name': 'Unicornio Mágico',
                'description': 'Unicornio colorido con cuerno dorado y cola de arcoíris.',
                'price': 28.99,
                'stock': 6,
                'category_id': 1,
                'image_url': 'https://images.unsplash.com/photo-1529927066849-79b791a69825?ixlib=rb-4.0.3&w=500'
            },
            {
                'name': 'Gorro de Invierno',
                'description': 'Gorro cálido con pompón, disponible en varios colores.',
                'price': 15.00,
                'stock': 20,
                'category_id': 2,
                'image_url': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?ixlib=rb-4.0.3&w=500'
            }
        ]

        for prod_data in products_data:
            product = Product(
                name=prod_data['name'],
                description=prod_data['description'],
                price=prod_data['price'],
                stock=prod_data['stock'],
                category_id=prod_data['category_id'],
                image_url=prod_data['image_url']
            )
            db.session.add(product)

        # Crear usuario de prueba
        test_user = User(
            email='test@example.com',
            first_name='Usuario',
            last_name='Prueba',
            phone='555-0123',
            address='123 Calle Principal, Ciudad, País'
        )
        test_user.set_password('password123')
        db.session.add(test_user)

        db.session.commit()
        print(f"✅ Created {len(products_data)} products")
        print("✅ Created test user: test@example.com / password123")
        print("🎉 Sample data created successfully!")

    @app.cli.command("insert-test-data")
    def insert_test_data():
        pass
