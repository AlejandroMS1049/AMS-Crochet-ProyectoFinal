"""
Script para crear usuario administrador y datos de muestra
"""
from werkzeug.security import generate_password_hash
from api.models import db, User, Category, Product
from app import app
import sys
import os
from dotenv import load_dotenv

# Add the src directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Cargar variables de entorno
load_dotenv()


def create_users():
    """Crea usuarios de prueba"""
    users_data = [
        {
            'email': 'admin@amscrochet.com',
            'password': 'admin123',
            'first_name': 'Admin',
            'last_name': 'AMS Crochet'
        },
        {
            'email': 'test@example.com',
            'password': 'password123',
            'first_name': 'Test',
            'last_name': 'User'
        }
    ]

    for user_data in users_data:
        # Verificar si ya existe
        existing_user = User.query.filter_by(email=user_data['email']).first()
        if existing_user:
            print(f"Usuario ya existe: {user_data['email']}")
            continue

        # Crear usuario
        user = User(
            email=user_data['email'],
            password=generate_password_hash(user_data['password']),
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            is_active=True
        )

        db.session.add(user)
        print(
            f"Usuario creado: {user_data['email']} / {user_data['password']}")

    db.session.commit()


def create_categories():
    """Crea categorías de productos"""
    if Category.query.count() > 0:
        print("Las categorías ya existen")
        return

    categories = [
        {'name': 'Amiguis', 'description': 'Muñecos y figuras tejidas a crochet'},
        {'name': 'Ropa', 'description': 'Prendas de vestir hechas a crochet'},
        {'name': 'Accesorios', 'description': 'Bolsos, carteras y accesorios'},
        {'name': 'Decoración', 'description': 'Elementos decorativos para el hogar'}
    ]

    for cat_data in categories:
        category = Category(
            name=cat_data['name'],
            description=cat_data['description']
        )
        db.session.add(category)

    db.session.commit()
    print("Categorías creadas exitosamente")


def create_products():
    """Crea productos de muestra"""
    if Product.query.count() > 0:
        print("Los productos ya existen")
        return

    products = [
        {
            'name': 'Osito de Peluche',
            'description': 'Adorable osito tejido a mano con hilo suave.',
            'price': 25.99,
            'stock': 10,
            'category_id': 1,
            'image_url': 'https://images.unsplash.com/photo-1529927066849-79b791a69825?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Bufanda Multicolor',
            'description': 'Bufanda tejida con colores vibrantes.',
            'price': 18.50,
            'stock': 15,
            'category_id': 2,
            'image_url': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Bolso de Playa',
            'description': 'Bolso espacioso y resistente.',
            'price': 32.00,
            'stock': 8,
            'category_id': 3,
            'image_url': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Almohadón Decorativo',
            'description': 'Almohadón tejido ideal para decorar tu hogar.',
            'price': 20.00,
            'stock': 12,
            'category_id': 4,
            'image_url': 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Gorro Infantil',
            'description': 'Gorro divertido y colorido para niños.',
            'price': 15.00,
            'stock': 20,
            'category_id': 2,
            'image_url': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Llavero Amigurumi',
            'description': 'Pequeño llavero tejido en forma de animalito.',
            'price': 7.50,
            'stock': 30,
            'category_id': 1,
            'image_url': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Cartera Boho',
            'description': 'Cartera estilo boho chic hecha a crochet.',
            'price': 28.00,
            'stock': 9,
            'category_id': 3,
            'image_url': 'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Tapete Redondo',
            'description': 'Tapete decorativo para sala o dormitorio.',
            'price': 22.00,
            'stock': 6,
            'category_id': 4,
            'image_url': 'https://images.unsplash.com/photo-1465101178521-c1a4c8a0f8f5?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Conejito Amigurumi',
            'description': 'Conejito tejido ideal para regalar.',
            'price': 19.99,
            'stock': 14,
            'category_id': 1,
            'image_url': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Chaleco de Verano',
            'description': 'Chaleco ligero y fresco para días soleados.',
            'price': 24.50,
            'stock': 11,
            'category_id': 2,
            'image_url': 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?ixlib=rb-4.0.3&w=500'
        }
    ]

    for prod_data in products:
        product = Product(
            name=prod_data['name'],
            description=prod_data['description'],
            price=prod_data['price'],
            stock=prod_data['stock'],
            category_id=prod_data['category_id'],
            image_url=prod_data['image_url'],
            is_active=True
        )
        db.session.add(product)

    db.session.commit()
    print("Productos creados exitosamente")


if __name__ == '__main__':
    with app.app_context():
        try:
            # Crear tablas si no existen
            db.create_all()

            # Crear datos de muestra
            create_users()
            create_categories()
            create_products()

            print("\n✅ Datos de muestra creados exitosamente:")
            print("- Usuarios: admin@amscrochet.com / admin123")
            print("- Usuarios: test@example.com / password123")
            print("- 4 categorías de productos")
            print("- 3 productos de ejemplo")

        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
