"""
Script para crear usuario administrador y datos de muestra
"""
from api.models import db, User, Category, Product
from werkzeug.security import generate_password_hash


def create_admin_user():
    """Crea un usuario administrador"""
    admin_email = 'admin@amscrochet.com'

    # Verificar si ya existe
    existing_admin = User.query.filter_by(email=admin_email).first()
    if existing_admin:
        print("Usuario administrador ya existe")
        return existing_admin

    # Crear usuario administrador
    admin = User(
        email=admin_email,
        first_name='Admin',
        last_name='AMS Crochet',
        phone='',
        address=''
    )
    admin.set_password('admin123')  # Contraseña por defecto

    db.session.add(admin)
    db.session.commit()

    print(f"Usuario administrador creado: {admin_email} / admin123")
    return admin


def create_sample_data():
    """Crea datos de muestra para la tienda"""

    # Crear administrador primero
    create_admin_user()

    # Verificar si ya existen categorías
    if Category.query.count() > 0:
        print("Las categorías ya existen")
        return

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
    print("Categorías creadas exitosamente")

    # Crear productos
    products = [
        {
            'name': 'Osito de Peluche',
            'description': 'Adorable osito tejido a mano con hilo suave. Perfecto para bebés y niños. Hecho con materiales hipoalergénicos y seguros.',
            'price': 25.99,
            'stock': 10,
            'category_id': 1,
            'image_url': 'https://images.unsplash.com/photo-1529927066849-79b791a69825?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Bufanda Multicolor',
            'description': 'Bufanda tejida con colores vibrantes, ideal para días fríos. Suave y cálida, perfecta para cualquier ocasión.',
            'price': 18.50,
            'stock': 15,
            'category_id': 2,
            'image_url': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Bolso de Playa',
            'description': 'Bolso espacioso y resistente, perfecto para llevar a la playa. Con asas reforzadas y diseño elegante.',
            'price': 32.00,
            'stock': 8,
            'category_id': 3,
            'image_url': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Cojín Decorativo',
            'description': 'Hermoso cojín con patrones geométricos para decorar tu sofá. Relleno incluido y funda lavable.',
            'price': 22.75,
            'stock': 12,
            'category_id': 4,
            'image_url': 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Unicornio Mágico',
            'description': 'Unicornio colorido con cuerno dorado y cola de arcoíris. Un regalo perfecto para los más pequeños.',
            'price': 28.99,
            'stock': 6,
            'category_id': 1,
            'image_url': 'https://images.unsplash.com/photo-1550558111-6cdcf8c59369?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Gorro de Invierno',
            'description': 'Gorro cálido con pompón, disponible en varios colores. Tejido con lana suave y resistente.',
            'price': 15.00,
            'stock': 20,
            'category_id': 2,
            'image_url': 'https://images.unsplash.com/photo-1552628813-aa2d85757f1c?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Monedero Pequeño',
            'description': 'Monedero compacto con cremallera y forro interior. Perfecto para llevar tarjetas y monedas.',
            'price': 12.50,
            'stock': 25,
            'category_id': 3,
            'image_url': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Mantel Individual',
            'description': 'Set de manteles individuales con diseño floral. Fáciles de lavar y resistentes al uso diario.',
            'price': 16.25,
            'stock': 18,
            'category_id': 4,
            'image_url': 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Elefante de Peluche',
            'description': 'Tierno elefante gris con detalles bordados. Ideal como compañero de juegos o decoración.',
            'price': 31.50,
            'stock': 7,
            'category_id': 1,
            'image_url': 'https://images.unsplash.com/photo-1529927066849-79b791a69825?ixlib=rb-4.0.3&w=500'
        },
        {
            'name': 'Chaleco Elegante',
            'description': 'Chaleco tejido con diseño clásico, perfecto para ocasiones especiales. Disponible en varios talles.',
            'price': 42.00,
            'stock': 5,
            'category_id': 2,
            'image_url': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?ixlib=rb-4.0.3&w=500'
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
    print("\nDatos de muestra creados:")
    print("- Usuario administrador: admin@amscrochet.com / admin123")
    print("- 4 categorías de productos")
    print("- 10 productos de ejemplo")


if __name__ == '__main__':
    from app import app

    with app.app_context():
        try:
            create_sample_data()
        except Exception as e:
            print(f"Error: {e}")
            # Intenta crear las tablas primero
            db.create_all()
            create_sample_data()
