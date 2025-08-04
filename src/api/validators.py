"""
Validaciones adicionales para la aplicación
"""
import re
from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import User


def validate_email(email):
    """Valida formato de email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password):
    """Valida que la contraseña cumpla con los requisitos mínimos"""
    if len(password) < 6:
        return False, "La contraseña debe tener al menos 6 caracteres"

    if not re.search(r'[A-Za-z]', password):
        return False, "La contraseña debe contener al menos una letra"

    if not re.search(r'[0-9]', password):
        return False, "La contraseña debe contener al menos un número"

    return True, "Contraseña válida"


def validate_phone(phone):
    """Valida formato de teléfono"""
    if not phone:
        return True  # Teléfono es opcional

    # Permitir formatos como: +1234567890, 123-456-7890, (123) 456-7890, etc.
    pattern = r'^[\+]?[1-9][\d]{0,15}$|^[\+]?[(]?[\d\s\-\(\)]{10,}$'
    return re.match(pattern, phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')) is not None


def validate_card_number(card_number):
    """Valida número de tarjeta de crédito usando algoritmo de Luhn"""
    if not card_number:
        return False

    # Remover espacios y guiones
    card_number = card_number.replace(' ', '').replace('-', '')

    # Verificar que solo contenga dígitos
    if not card_number.isdigit():
        return False

    # Verificar longitud (13-19 dígitos)
    if len(card_number) < 13 or len(card_number) > 19:
        return False

    # Algoritmo de Luhn
    def luhn_check(card_num):
        total = 0
        reverse_digits = card_num[::-1]

        for i, digit in enumerate(reverse_digits):
            digit = int(digit)
            if i % 2 == 1:
                digit *= 2
                if digit > 9:
                    digit -= 9
            total += digit

        return total % 10 == 0

    return luhn_check(card_number)


def validate_expiry_date(expiry_date):
    """Valida fecha de expiración de tarjeta (MM/YY)"""
    if not expiry_date:
        return False

    pattern = r'^(0[1-9]|1[0-2])\/([0-9]{2})$'
    if not re.match(pattern, expiry_date):
        return False

    month, year = expiry_date.split('/')
    month = int(month)
    year = int('20' + year)  # Asumir 20XX

    from datetime import datetime
    current_date = datetime.now()
    current_year = current_date.year
    current_month = current_date.month

    # Verificar que no esté expirada
    if year < current_year or (year == current_year and month < current_month):
        return False

    return True


def validate_cvv(cvv):
    """Valida CVV"""
    if not cvv:
        return False

    return cvv.isdigit() and len(cvv) in [3, 4]


def admin_required(f):
    """Decorador para rutas que requieren permisos de administrador"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or not getattr(user, 'is_admin', False):
            return jsonify({"error": "Se requieren permisos de administrador"}), 403

        return f(*args, **kwargs)
    return decorated_function


def validate_product_data(data):
    """Valida datos de producto"""
    errors = []

    if not data.get('name') or len(data['name'].strip()) < 2:
        errors.append(
            "El nombre del producto debe tener al menos 2 caracteres")

    if not data.get('description') or len(data['description'].strip()) < 10:
        errors.append("La descripción debe tener al menos 10 caracteres")

    try:
        price = float(data.get('price', 0))
        if price <= 0:
            errors.append("El precio debe ser mayor a 0")
    except (ValueError, TypeError):
        errors.append("El precio debe ser un número válido")

    try:
        stock = int(data.get('stock', 0))
        if stock < 0:
            errors.append("El stock no puede ser negativo")
    except (ValueError, TypeError):
        errors.append("El stock debe ser un número entero válido")

    if not data.get('category_id'):
        errors.append("La categoría es requerida")

    return errors


def validate_user_data(data, is_update=False):
    """Valida datos de usuario"""
    errors = []

    if not is_update or 'email' in data:
        email = data.get('email', '').strip()
        if not email:
            errors.append("El email es requerido")
        elif not validate_email(email):
            errors.append("Formato de email inválido")

    if not is_update or 'first_name' in data:
        first_name = data.get('first_name', '').strip()
        if not first_name or len(first_name) < 2:
            errors.append("El nombre debe tener al menos 2 caracteres")

    if not is_update or 'last_name' in data:
        last_name = data.get('last_name', '').strip()
        if not last_name or len(last_name) < 2:
            errors.append("El apellido debe tener al menos 2 caracteres")

    if 'phone' in data and data['phone']:
        if not validate_phone(data['phone']):
            errors.append("Formato de teléfono inválido")

    if not is_update and 'password' in data:
        is_valid, message = validate_password(data['password'])
        if not is_valid:
            errors.append(message)

    return errors


def sanitize_input(text):
    """Sanitiza entrada de texto para prevenir XSS"""
    if not text:
        return text

    # Remover caracteres peligrosos
    dangerous_chars = ['<', '>', '"', "'", '&', 'javascript:', 'data:']
    for char in dangerous_chars:
        text = text.replace(char, '')

    return text.strip()


def rate_limit_by_ip(max_requests=100, window_seconds=3600):
    """
    Decorador para limitar requests por IP
    (Implementación básica - en producción usar Redis)
    """
    request_counts = {}

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            from time import time

            client_ip = request.environ.get(
                'HTTP_X_REAL_IP', request.remote_addr)
            current_time = time()

            # Limpiar requests antiguos
            if client_ip in request_counts:
                request_counts[client_ip] = [
                    timestamp for timestamp in request_counts[client_ip]
                    if current_time - timestamp < window_seconds
                ]
            else:
                request_counts[client_ip] = []

            # Verificar límite
            if len(request_counts[client_ip]) >= max_requests:
                return jsonify({"error": "Demasiadas solicitudes. Intenta más tarde."}), 429

            # Registrar request actual
            request_counts[client_ip].append(current_time)

            return f(*args, **kwargs)
        return decorated_function
    return decorator
