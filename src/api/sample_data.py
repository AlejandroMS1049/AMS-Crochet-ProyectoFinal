"""
Script para crear datos de prueba para la tienda AMS Crochet
"""
from api.models import db, User, Category, Product
from werkzeug.security import generate_password_hash


def create_sample_data():
    # Crear categorías
    categories = [
        {
            'name': 'Amigurumis',
            'description': 'Muñecos y figuras tejidas a crochet'
        },
        {
            'name': 'Ropa',
            'description': 'Prendas de vestir hechas a crochet'
        },
        {
            'name': 'Accesorios',
            'description': 'Bolsos, carteras y accesorios'
        },
        {
            'name': 'Decoración',
            'description': 'Elementos decorativos para el hogar'
        }
    ]

    category_objects = []
    for cat_data in categories:
        category = Category(
            name=cat_data['name'],
            description=cat_data['description']
        )
        db.session.add(category)
        category_objects.append(category)

    db.session.commit()

    # Crear productos
    products = [
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
        },
        {
            'name': 'Monedero Pequeño',
            'description': 'Monedero compacto con cremallera y forro interior.',
            'price': 12.50,
            'stock': 25,
            'category_id': 3,
            'image_url': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Mantel Individual',
            'description': 'Set de manteles individuales con diseño floral.',
            'price': 16.00,
            'stock': 18,
            'category_id': 4,
            'image_url': 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&w=500'
        }
    ]

    for prod_data in products:
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
    print("✅ Datos de prueba creados exitosamente!")
    print("👤 Usuario de prueba: test@example.com / password123")
    print(f"📦 {len(products)} productos creados")
    print(f"🏷️ {len(categories)} categorías creadas")


if __name__ == '__main__':
    create_sample_data()
