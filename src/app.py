"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
import sys
from datetime import timedelta
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands

sys.path.append(os.path.dirname(os.path.realpath(__file__)))

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')

app = Flask(__name__)
app.config['APPLICATION_NAME'] = 'API CROCHET'
app.url_map.strict_slashes = False

CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://*.gitpod.io",
            "https://*.codespaces.githubusercontent.com"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

app.config['JWT_SECRET_KEY'] = os.getenv(
    'JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
jwt = JWTManager(app)


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("JWT token expired")
    return jsonify({"error": "Token has expired"}), 401


@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"Invalid JWT token: {error}")
    return jsonify({"error": "Invalid token"}), 422


@jwt.unauthorized_loader
def unauthorized_callback(error):
    print(f"Unauthorized JWT: {error}")
    return jsonify({"error": "Authentication required"}), 401


db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

setup_admin(app)
setup_commands(app)
app.register_blueprint(api, url_prefix='/api')


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    index_path = os.path.join(static_file_dir, 'index.html')
    if os.path.isfile(index_path):
        with open(index_path, 'r', encoding='utf-8') as f:
            html = f.read()
        html = html.replace('<title>', '<title>API CROCHET - ')
        return html
    return send_from_directory(static_file_dir, 'index.html')


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response


if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    print(f"🚀 Starting Flask server on port {PORT}...")
    print("🔗 CORS configured for frontend on port 3000")
    app.run(host='0.0.0.0', port=PORT, debug=True)
