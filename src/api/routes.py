"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Product, Category, CartItem, Order, OrderItem
from api.utils import generate_sitemap, APIException
from api.validators import (
    validate_user_data, validate_card_number, validate_expiry_date,
    validate_cvv, sanitize_input, rate_limit_by_ip
)
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash
from datetime import timedelta

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

# Auth endpoints


@api.route('/register', methods=['POST'])
def register():
    try:
        body = request.get_json()

        if not body:
            return jsonify({"error": "Request body is required"}), 400

        # Validaciones
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if field not in body or not body[field]:
                return jsonify({"error": f"{field} is required"}), 400

        # Verificar si el usuario ya existe
        if User.query.filter_by(email=body['email']).first():
            return jsonify({"error": "User already exists"}), 400

        # Crear nuevo usuario
        user = User(
            email=body['email'],
            first_name=body['first_name'],
            last_name=body['last_name'],
            phone=body.get('phone'),
            address=body.get('address')
        )
        user.set_password(body['password'])

        db.session.add(user)
        db.session.commit()

        return jsonify(user.serialize()), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/login', methods=['POST'])
def login():
    try:
        body = request.get_json()

        if not body or not body.get('email') or not body.get('password'):
            return jsonify({"error": "Email and password are required"}), 400

        user = User.query.filter_by(email=body['email']).first()

        if not user or not user.check_password(body['password']):
            return jsonify({"error": "Invalid credentials"}), 401

        if not user.is_active:
            return jsonify({"error": "Account is deactivated"}), 401

        # Crear token
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=7)
        )

        return jsonify({
            "access_token": access_token,
            "user": user.serialize()
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify(user.serialize()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        body = request.get_json()

        # Actualizar campos
        if 'first_name' in body:
            user.first_name = body['first_name']
        if 'last_name' in body:
            user.last_name = body['last_name']
        if 'phone' in body:
            user.phone = body['phone']
        if 'address' in body:
            user.address = body['address']
        if 'email' in body:
            # Verificar que el email no esté en uso
            existing_user = User.query.filter_by(email=body['email']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({"error": "Email already in use"}), 400
            user.email = body['email']

        db.session.commit()

        return jsonify(user.serialize()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        body = request.get_json()

        # Validar que se proporcionen los campos requeridos
        if not body.get('current_password') or not body.get('new_password'):
            return jsonify({"error": "Current password and new password are required"}), 400

        # Verificar la contraseña actual
        if not user.check_password(body['current_password']):
            return jsonify({"error": "Current password is incorrect"}), 400

        # Validar la nueva contraseña
        if len(body['new_password']) < 6:
            return jsonify({"error": "New password must be at least 6 characters long"}), 400

        # Actualizar la contraseña
        user.set_password(body['new_password'])
        db.session.commit()

        return jsonify({"message": "Password changed successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/profile', methods=['DELETE'])
@jwt_required()
def delete_account():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": "Account deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Product endpoints


@api.route('/products', methods=['GET'])
def get_products():
    try:
        category_id = request.args.get('category_id')
        search = request.args.get('search')

        query = Product.query.filter_by(is_active=True)

        if category_id:
            query = query.filter_by(category_id=category_id)

        if search:
            query = query.filter(Product.name.contains(search))

        products = query.all()

        return jsonify([product.serialize() for product in products]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product = Product.query.get(product_id)

        if not product or not product.is_active:
            return jsonify({"error": "Product not found"}), 404

        return jsonify(product.serialize()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Categories endpoints


@api.route('/categories', methods=['GET'])
def get_categories():
    try:
        categories = Category.query.all()
        return jsonify([category.serialize() for category in categories]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Cart endpoints


@api.route('/cart', methods=['GET'])
@jwt_required()
def get_cart():
    try:
        user_id = get_jwt_identity()
        cart_items = CartItem.query.filter_by(user_id=user_id).all()

        return jsonify([item.serialize() for item in cart_items]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/cart', methods=['POST'])
@jwt_required()
def add_to_cart():
    try:
        user_id = get_jwt_identity()
        body = request.get_json()

        if not body or not body.get('product_id'):
            return jsonify({"error": "Product ID is required"}), 400

        product = Product.query.get(body['product_id'])
        if not product or not product.is_active:
            return jsonify({"error": "Product not found"}), 404

        quantity = body.get('quantity', 1)

        # Verificar si el producto ya está en el carrito
        existing_item = CartItem.query.filter_by(
            user_id=user_id,
            product_id=body['product_id']
        ).first()

        if existing_item:
            existing_item.quantity += quantity
        else:
            cart_item = CartItem(
                user_id=user_id,
                product_id=body['product_id'],
                quantity=quantity
            )
            db.session.add(cart_item)

        db.session.commit()

        return jsonify({"message": "Product added to cart"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/cart/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(item_id):
    try:
        user_id = get_jwt_identity()
        body = request.get_json()

        item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()

        if not item:
            return jsonify({"error": "Cart item not found"}), 404

        if 'quantity' in body:
            item.quantity = body['quantity']

        db.session.commit()

        return jsonify(item.serialize()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/cart/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    try:
        user_id = get_jwt_identity()

        item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()

        if not item:
            return jsonify({"error": "Cart item not found"}), 404

        db.session.delete(item)
        db.session.commit()

        return jsonify({"message": "Item removed from cart"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Orders endpoints


@api.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    try:
        user_id = get_jwt_identity()
        orders = Order.query.filter_by(user_id=user_id).order_by(
            Order.created_at.desc()).all()

        return jsonify([order.serialize() for order in orders]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    try:
        user_id = get_jwt_identity()
        order = Order.query.filter_by(id=order_id, user_id=user_id).first()

        if not order:
            return jsonify({"error": "Order not found"}), 404

        return jsonify(order.serialize()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():
    try:
        user_id = get_jwt_identity()
        body = request.get_json()

        if not body:
            return jsonify({"error": "Request body is required"}), 400

        # Validaciones
        required_fields = ['shipping_address', 'payment_method']
        for field in required_fields:
            if field not in body or not body[field]:
                return jsonify({"error": f"{field} is required"}), 400

        # Obtener items del carrito
        cart_items = CartItem.query.filter_by(user_id=user_id).all()

        if not cart_items:
            return jsonify({"error": "Cart is empty"}), 400

        # Calcular total
        total_amount = 0
        order_items_data = []

        for cart_item in cart_items:
            if not cart_item.product.is_active:
                return jsonify({"error": f"Product {cart_item.product.name} is not available"}), 400

            if cart_item.product.stock < cart_item.quantity:
                return jsonify({"error": f"Insufficient stock for {cart_item.product.name}"}), 400

            item_total = cart_item.product.price * cart_item.quantity
            total_amount += item_total

            order_items_data.append({
                'product_id': cart_item.product_id,
                'quantity': cart_item.quantity,
                'price': cart_item.product.price
            })

        # Crear orden
        order = Order(
            user_id=user_id,
            total_amount=total_amount,
            status='pending',
            payment_method=body['payment_method'],
            shipping_address=body['shipping_address']
        )

        db.session.add(order)
        db.session.flush()  # Para obtener el ID de la orden

        # Crear items de la orden y actualizar stock
        for item_data in order_items_data:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data['product_id'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )
            db.session.add(order_item)

            # Actualizar stock
            product = Product.query.get(item_data['product_id'])
            product.stock -= item_data['quantity']

        # Procesar pago (simulado)
        payment_result = process_payment(
            amount=total_amount,
            payment_method=body['payment_method'],
            order_id=order.id
        )

        if payment_result['success']:
            order.status = 'paid'

            # Limpiar carrito
            for cart_item in cart_items:
                db.session.delete(cart_item)
        else:
            order.status = 'payment_failed'
            return jsonify({"error": "Payment failed", "details": payment_result.get('message')}), 400

        db.session.commit()

        return jsonify({
            "message": "Order created successfully",
            "order": order.serialize(),
            "payment": payment_result
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Admin endpoints - CRUD completo para productos
@api.route('/admin/products', methods=['POST'])
@jwt_required()
def create_product():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        # Verificar si es admin (ajusta esta lógica según tus necesidades)
        if not user or user.email != 'admin@amscrochet.com':
            return jsonify({"error": "Access denied. Admin privileges required"}), 403

        body = request.get_json()

        # Validar campos requeridos
        required_fields = ['name', 'description',
                           'price', 'stock', 'category_id']
        for field in required_fields:
            if field not in body:
                return jsonify({"error": f"{field} is required"}), 400

        # Verificar que la categoría existe
        category = Category.query.get(body['category_id'])
        if not category:
            return jsonify({"error": "Category not found"}), 404

        # Crear nuevo producto
        product = Product(
            name=body['name'],
            description=body['description'],
            price=float(body['price']),
            stock=int(body['stock']),
            category_id=int(body['category_id']),
            image_url=body.get('image_url', ''),
            is_active=body.get('is_active', True)
        )

        db.session.add(product)
        db.session.commit()

        return jsonify(product.serialize()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/admin/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        # Verificar si es admin
        if not user or user.email != 'admin@amscrochet.com':
            return jsonify({"error": "Access denied. Admin privileges required"}), 403

        product = Product.query.get(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404

        body = request.get_json()

        # Actualizar campos si están presentes
        if 'name' in body:
            product.name = body['name']
        if 'description' in body:
            product.description = body['description']
        if 'price' in body:
            product.price = float(body['price'])
        if 'stock' in body:
            product.stock = int(body['stock'])
        if 'category_id' in body:
            # Verificar que la categoría existe
            category = Category.query.get(body['category_id'])
            if not category:
                return jsonify({"error": "Category not found"}), 404
            product.category_id = int(body['category_id'])
        if 'image_url' in body:
            product.image_url = body['image_url']
        if 'is_active' in body:
            product.is_active = body['is_active']

        db.session.commit()

        return jsonify(product.serialize()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/admin/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        # Verificar si es admin
        if not user or user.email != 'admin@amscrochet.com':
            return jsonify({"error": "Access denied. Admin privileges required"}), 403

        product = Product.query.get(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404

        # Verificar si el producto está en órdenes existentes
        order_items = OrderItem.query.filter_by(product_id=product_id).first()
        if order_items:
            # En lugar de eliminar, marcar como inactivo
            product.is_active = False
            db.session.commit()
            return jsonify({"message": "Product deactivated due to existing orders"}), 200

        # Si no hay referencias, eliminar completamente
        db.session.delete(product)
        db.session.commit()

        return jsonify({"message": "Product deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        # Verificar si es admin
        if not user or user.email != 'admin@amscrochet.com':
            return jsonify({"error": "Access denied. Admin privileges required"}), 403

        users = User.query.all()
        return jsonify([user.serialize() for user in users]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def process_payment(amount, payment_method, order_id):
    """
    Simulación de procesamiento de pago.
    En producción, aquí integrarías con Stripe, PayPal, etc.
    """
    import random
    import time

    # Simular tiempo de procesamiento
    time.sleep(1)

    # Simular éxito/fallo (95% éxito)
    success = random.random() > 0.05

    if success:
        return {
            'success': True,
            'transaction_id': f'txn_{order_id}_{int(time.time())}',
            'amount': amount,
            'payment_method': payment_method,
            'status': 'completed'
        }
    else:
        return {
            'success': False,
            'message': 'Payment declined by bank',
            'status': 'failed'
        }


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200
