"""
API endpoints for AMS Crochet
"""
from flask import Blueprint, request, jsonify
from api.models import db, User, Product, Category, CartItem, Order, OrderItem
from api.utils import generate_sitemap, APIException
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash

api = Blueprint('api', __name__)

# Auth endpoints


@api.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password are required"}), 400

        email = data['email']
        password = data['password']

        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password, password):
            return jsonify({"error": "Invalid credentials"}), 401

        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "token": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "is_active": user.is_active
            }
        }), 200

    except Exception as e:
        print(f"LOGIN ERROR: {e}")
        return jsonify({"error": "Login failed"}), 500


@api.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password are required"}), 400

        email = data['email']
        password = data['password']

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "User already exists"}), 400

        hashed_password = generate_password_hash(password)
        new_user = User(email=email, password=hashed_password, is_active=True)
        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=str(new_user.id))
        return jsonify({
            "token": access_token,
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "is_active": new_user.is_active
            }
        }), 201

    except Exception as e:
        print(f"Register error: {e}")
        db.session.rollback()
        return jsonify({"error": "Registration failed"}), 500


# CRUD para Product
@api.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([product.serialize() for product in products]), 200


@api.route('/products', methods=['POST'])
def create_product():
    data = request.get_json()
    product = Product(
        name=data.get('name'),
        description=data.get('description'),
        price=data.get('price'),
        stock=data.get('stock'),
        category_id=data.get('category_id'),
        image_url=data.get('image_url'),
        is_active=True
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.serialize()), 201


@api.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({'error': 'Producto no encontrado'}), 404
    data = request.get_json()
    product.name = data.get('name', product.name)
    product.description = data.get('description', product.description)
    product.price = data.get('price', product.price)
    product.stock = data.get('stock', product.stock)
    product.category_id = data.get('category_id', product.category_id)
    product.image_url = data.get('image_url', product.image_url)
    db.session.commit()
    return jsonify(product.serialize()), 200


@api.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({'error': 'Producto no encontrado'}), 404
    db.session.delete(product)
    db.session.commit()
    return jsonify({'result': 'Producto eliminado'}), 200

# Test endpoint


@api.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "API is working!"}), 200
