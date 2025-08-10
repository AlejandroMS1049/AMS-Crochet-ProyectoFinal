from flask import Blueprint, jsonify

bp_test_db = Blueprint('test_db', __name__)


@bp_test_db.route('/api/test-db')
def test_db():
    return jsonify({'status': 'ok', 'message': 'Backend activo, sin base de datos'}), 200
