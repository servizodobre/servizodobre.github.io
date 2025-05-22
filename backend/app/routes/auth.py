import sqlite3
from flask import Blueprint, request, jsonify
from app.database import get_db_connection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO users (username, password, category) VALUES (?, ?, ?)',
            (username, password, 'user')
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already exists'}), 400
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500




@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        response = jsonify({'error': 'Username and password are required'})
        response.headers.add('Access-Control-Allow-Origin', 'https://servizodobre.com')
        return response, 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'SELECT category FROM users WHERE username = ? AND password = ?',
            (username, password)
        )
        result = cursor.fetchone()
        conn.close()

        if result:
            category = result[0]
            response = jsonify({'message': 'Login successful', 'username': username, 'category': category})
            response.headers.add('Access-Control-Allow-Origin', 'https://servizodobre.com')
            return response
        else:
            response = jsonify({'error': 'Invalid username or password'})
            response.headers.add('Access-Control-Allow-Origin', 'https://servizodobre.com')
            return response, 401
    except Exception as e:
        response = jsonify({'error': f'An unexpected error occurred: {str(e)}'})
        response.headers.add('Access-Control-Allow-Origin', 'https://servizodobre.com')
        return response, 500


@auth_bp.route('/login', methods=['OPTIONS'])
def login_options():
    response = jsonify({'message': 'CORS preflight successful'})
    response.headers.add('Access-Control-Allow-Origin', 'https://servizodobre.com')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
    return response

