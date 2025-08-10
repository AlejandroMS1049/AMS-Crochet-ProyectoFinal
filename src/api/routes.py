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


@api.route('/products', methods=['GET'])
def get_products():
    try:
        products = Product.query.all()
        return jsonify([product.serialize() for product in products]), 200
    except Exception as e:
        print(f"Get products error: {e}")
        return jsonify({"error": "Failed to fetch products"}), 500

# Test endpoint


@api.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "API is working!"}), 200
