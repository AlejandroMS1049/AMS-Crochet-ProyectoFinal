"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Product, Category, CartItem, Order, OrderItem
from api.utils import generate_sitemap, APIException
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


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200
