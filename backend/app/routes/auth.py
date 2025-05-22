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
        return jsonify({'error': 'Username and password are required'}), 400

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
            return jsonify({'message': 'Login successful', 'username': username, 'category': category})
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

