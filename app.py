from flask import Flask, request, jsonify
from flask_cors import CORS  # Import Flask-CORS
from paddleocr import PaddleOCR
import os
import sqlite3

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://servizodobre.com"}})  # Allow all endpoints for your domain

ocr = PaddleOCR(use_angle_cls=True, lang='en')  # Initialize PaddleOCR

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize the database
def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            category TEXT DEFAULT 'user'
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    # Perform OCR
    result = ocr.ocr(file_path, cls=True)
    extracted_text = '\n'.join([line[1][0] for line in result[0]])

    # Clean up uploaded file
    os.remove(file_path)

    return jsonify({'text': extracted_text})

# Route to handle user registration
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    print("Received data:", data)  # Debug: Print received data
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        print("Missing username or password")  # Debug: Missing data
        return jsonify({'error': 'Username and password are required'}), 400

    try:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (username, password, category) VALUES (?, ?, ?)', (username, password, 'user'))
        conn.commit()
        conn.close()
        print("User registered successfully")  # Debug: Success
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError as e:
        print("IntegrityError:", e)  # Debug: Integrity error
        return jsonify({'error': 'Username already exists'}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    try:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute('SELECT category FROM users WHERE username = ? AND password = ?', (username, password))
        result = cursor.fetchone()
        conn.close()

        if result:
            category = result[0]
            return jsonify({'message': 'Login successful', 'category': category})
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
    except Exception as e:
        print('Error:', e)
        return jsonify({'error': 'An error occurred while processing the login'}), 500

@app.route('/users', methods=['GET'])
def get_users():
    try:
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 5))
        offset = (page - 1) * limit

        # Connect to the database
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()

        # Fetch users with pagination
        cursor.execute('SELECT username, category FROM users LIMIT ? OFFSET ?', (limit, offset))
        users = [{'username': row[0], 'category': row[1]} for row in cursor.fetchall()]

        # Get total user count for pagination
        cursor.execute('SELECT COUNT(*) FROM users')
        total_users = cursor.fetchone()[0]
        total_pages = (total_users + limit - 1) // limit  # Calculate total pages

        conn.close()

        # Return users and pagination info
        return jsonify({
            'users': users,
            'page': page,
            'totalPages': total_pages
        })
    except Exception as e:
        print('Error fetching users:', e)
        return jsonify({'error': 'An error occurred while fetching users'}), 500

if __name__ == '__main__':
    app.run(debug=True)