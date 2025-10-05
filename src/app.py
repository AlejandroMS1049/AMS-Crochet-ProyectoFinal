"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
import sys
from datetime import timedelta
from flask import Flask, request, jsonify, url_for, send_from_directory, Blueprint, jsonify
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from dotenv import load_dotenv
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.realpath(__file__)))

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
app.config['APPLICATION_NAME'] = 'API CROCHET'
app.url_map.strict_slashes = False

CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://*.gitpod.io",
            "https://*.codespaces.githubusercontent.com",
            "https://special-parakeet-jjv5xj9v6p5f5jw9-3001.app.github.dev"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
}, supports_credentials=True)

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


app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SECRET_KEY'] = os.getenv('FLASK_APP_KEY')
app.config['DEBUG'] = os.getenv('FLASK_DEBUG') == '1'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

setup_admin(app)
setup_commands(app)
# Registrar solo una vez los blueprints y evitar rutas duplicadas
app.register_blueprint(api, url_prefix='/api')


bp_test_db = Blueprint('test_db', __name__)


@bp_test_db.route('/test-db', methods=['GET'])
def test_db():
    try:
        db.session.execute(text('SELECT 1'))
        return jsonify({'status': 'ok', 'message': 'Conexión exitosa a la base de datos'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


app.register_blueprint(bp_test_db, url_prefix='/api')


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
