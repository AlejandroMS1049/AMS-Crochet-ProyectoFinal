"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Product, Category, CartItem, Order, OrderItem
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import timedelta

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

# Helper function to get user ID from JWT


def get_current_user_id():
    identity = get_jwt_identity()
    return int(identity) if identity else None

# Auth endpoints


@api.route('/login', methods=['POST'])
def login():
    try:
        print("=== LOGIN ATTEMPT ===")
        data = request.get_json()
        print(f"Request data: {data}")

        if not data or 'email' not in data or 'password' not in data:
            print("Missing email or password")
            return jsonify({"error": "Email and password are required"}), 400

        email = data['email']
        password = data['password']
        print(f"Login attempt for: {email}")

        user = User.query.filter_by(email=email).first()
        if not user:
            print(f"User not found: {email}")
            return jsonify({"error": "Invalid credentials"}), 401

        print(f"User found: {user.email}, checking password...")
        if not check_password_hash(user.password, password):
            print("Password check failed")
            return jsonify({"error": "Invalid credentials"}), 401

        print("Password verified, creating token...")
        access_token = create_access_token(identity=str(user.id))
        print(f"Token created for user {user.id}")

        response_data = {
            "token": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "is_active": user.is_active
            }
        }
        print(f"Login successful, returning: {response_data}")
        return jsonify(response_data), 200

    except Exception as e:
        print(f"LOGIN ERROR: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Login failed"}), 500


@api.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password are required"}), 400

        email = data['email']
        password = data['password']

        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "User already exists"}), 400

        # Create new user
        hashed_password = generate_password_hash(password)
        new_user = User(
            email=email,
            password=hashed_password,
            is_active=True
        )

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

# Products endpoints


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
