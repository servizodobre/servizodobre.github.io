from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS  # Import Flask-CORS
from paddleocr import PaddleOCR
import os
import sqlite3

DATABASE_PATH = 'data/users.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://servizodobre.com"}})  # Allow all endpoints for your domain

ocr = PaddleOCR(use_angle_cls=True, lang='en')  # Initialize PaddleOCR

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Serve the index.html from the templates directory
@app.route('/')
def index():
    return render_template('index.html')

# Initialize the database
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create the users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            category TEXT DEFAULT 'user'
        )
    ''')

    # Create the stores table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        )
    ''')

    # Create the items table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            category TEXT NOT NULL,
            description TEXT
        )
    ''')

    # Create the expenses table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            store_id INTEGER NOT NULL,
            item_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            bucket TEXT NOT NULL,
            FOREIGN KEY (store_id) REFERENCES stores (id),
            FOREIGN KEY (item_id) REFERENCES items (id)
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
        conn = get_db_connection()
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
        conn = get_db_connection()
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
        conn = get_db_connection()
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

@app.route('/stores', methods=['GET'])
def get_stores():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch all stores
        cursor.execute('SELECT id, name FROM stores')
        stores = [{'id': row[0], 'name': row[1]} for row in cursor.fetchall()]

        conn.close()
        return jsonify({'stores': stores})
    except Exception as e:
        print('Error fetching stores:', e)
        return jsonify({'error': 'An error occurred while fetching stores'}), 500


@app.route('/add_store', methods=['POST'])
def add_store():
    data = request.json
    name = data.get('name')

    if not name:
        return jsonify({'error': 'Store name is required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert the new store
        cursor.execute('INSERT INTO stores (name) VALUES (?)', (name,))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Store added successfully!'})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Store name must be unique'}), 400
    except Exception as e:
        print('Error adding store:', e)
        return jsonify({'error': 'An error occurred while adding the store'}), 500


@app.route('/edit_store', methods=['PUT'])
def edit_store():
    data = request.json
    store_id = data.get('id')
    new_name = data.get('name')

    if not store_id or not new_name:
        return jsonify({'error': 'Store ID and new name are required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Update the store name
        cursor.execute('UPDATE stores SET name = ? WHERE id = ?', (new_name, store_id))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Store updated successfully!'})
    except Exception as e:
        print('Error editing store:', e)
        return jsonify({'error': 'An error occurred while editing the store'}), 500


@app.route('/delete_store', methods=['DELETE'])
def delete_store():
    data = request.json
    store_id = data.get('id')

    if not store_id:
        return jsonify({'error': 'Store ID is required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Delete the store
        cursor.execute('DELETE FROM stores WHERE id = ?', (store_id,))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Store deleted successfully!'})
    except Exception as e:
        print('Error deleting store:', e)
        return jsonify({'error': 'An error occurred while deleting the store'}), 500

@app.route('/edit_user', methods=['PUT'])
def edit_user():
    data = request.json
    old_username = data.get('oldUsername')
    new_username = data.get('newUsername')
    new_password = data.get('password')
    new_category = data.get('category')

    if not old_username:
        return jsonify({'error': 'Old username is required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Update username, password, and category if provided
        if new_username:
            cursor.execute('UPDATE users SET username = ? WHERE username = ?', (new_username, old_username))
        if new_password:
            cursor.execute('UPDATE users SET password = ? WHERE username = ?', (new_password, new_username or old_username))
        if new_category:
            cursor.execute('UPDATE users SET category = ? WHERE username = ?', (new_category, new_username or old_username))

        conn.commit()
        conn.close()

        return jsonify({'message': 'User updated successfully!'})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'New username must be unique'}), 400
    except Exception as e:
        print('Error editing user:', e)
        return jsonify({'error': 'An error occurred while editing the user'}), 500

@app.route('/delete_user', methods=['DELETE'])
def delete_user():
    data = request.json
    username = data.get('username')

    if not username:
        return jsonify({'error': 'Username is required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Delete the user
        cursor.execute('DELETE FROM users WHERE username = ?', (username,))
        conn.commit()
        conn.close()

        return jsonify({'message': 'User deleted successfully!'})
    except Exception as e:
        print('Error deleting user:', e)
        return jsonify({'error': 'An error occurred while deleting the user'}), 500

@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    category = data.get('category', 'user')  # Default to 'user' if category is not provided

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert the new user
        cursor.execute('INSERT INTO users (username, password, category) VALUES (?, ?, ?)', (username, password, category))
        conn.commit()
        conn.close()

        return jsonify({'message': 'User added successfully!'})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already exists'}), 400
    except Exception as e:
        print('Error adding user:', e)
        return jsonify({'error': 'An error occurred while adding the user'}), 500

@app.route('/items', methods=['GET'])
def get_items():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch all items
        cursor.execute('SELECT id, name, category, description FROM items')
        items = [{'id': row[0], 'name': row[1], 'category': row[2], 'description': row[3]} for row in cursor.fetchall()]

        conn.close()
        return jsonify({'items': items})
    except Exception as e:
        print('Error fetching items:', e)
        return jsonify({'error': 'An error occurred while fetching items'}), 500

@app.route('/add_item', methods=['POST'])
def add_item():
    data = request.json
    name = data.get('name')
    category = data.get('category')
    description = data.get('description', '')

    if not name or not category:
        return jsonify({'error': 'Item name and category are required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert the new item
        cursor.execute('INSERT INTO items (name, category, description) VALUES (?, ?, ?)', (name, category, description))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Item added successfully!'})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Item name must be unique'}), 400
    except Exception as e:
        print('Error adding item:', e)
        return jsonify({'error': 'An error occurred while adding the item'}), 500

@app.route('/edit_item', methods=['PUT'])
def edit_item():
    data = request.json
    item_id = data.get('id')
    new_name = data.get('name')
    new_category = data.get('category')
    new_description = data.get('description')

    if not item_id:
        return jsonify({'error': 'Item ID is required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Update item details
        if new_name:
            cursor.execute('UPDATE items SET name = ? WHERE id = ?', (new_name, item_id))
        if new_category:
            cursor.execute('UPDATE items SET category = ? WHERE id = ?', (new_category, item_id))
        if new_description:
            cursor.execute('UPDATE items SET description = ? WHERE id = ?', (new_description, item_id))

        conn.commit()
        conn.close()

        return jsonify({'message': 'Item updated successfully!'})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Item name must be unique'}), 400
    except Exception as e:
        print('Error editing item:', e)
        return jsonify({'error': 'An error occurred while editing the item'}), 500

@app.route('/delete_item', methods=['DELETE'])
def delete_item():
    data = request.json
    item_id = data.get('id')

    if not item_id:
        return jsonify({'error': 'Item ID is required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Delete the item
        cursor.execute('DELETE FROM items WHERE id = ?', (item_id,))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Item deleted successfully!'})
    except Exception as e:
        print('Error deleting item:', e)
        return jsonify({'error': 'An error occurred while deleting the item'}), 500

@app.route('/expenses', methods=['GET'])
def get_expenses():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch all expenses
        cursor.execute('''
            SELECT e.date, s.name AS store, i.name AS item, e.quantity, e.price, e.bucket
            FROM expenses e
            JOIN stores s ON e.store_id = s.id
            JOIN items i ON e.item_id = i.id
        ''')
        expenses = [
            {'date': row[0], 'store': row[1], 'item': row[2], 'quantity': row[3], 'price': row[4], 'bucket': row[5]}
            for row in cursor.fetchall()
        ]

        conn.close()
        return jsonify({'expenses': expenses})
    except Exception as e:
        print('Error fetching expenses:', e)
        return jsonify({'error': 'An error occurred while fetching expenses'}), 500


@app.route('/add_expense', methods=['POST'])
def add_expense():
    data = request.json
    date = data.get('date')
    store_id = data.get('store')
    item_id = data.get('item')
    quantity = data.get('quantity')
    price = data.get('price')
    bucket = data.get('bucket')

    if not (date and store_id and item_id and quantity and price and bucket):
        return jsonify({'error': 'All fields are required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert the new expense
        cursor.execute('''
            INSERT INTO expenses (date, store_id, item_id, quantity, price, bucket)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (date, store_id, item_id, quantity, price, bucket))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Expense added successfully!'})
    except Exception as e:
        print('Error adding expense:', e)
        return jsonify({'error': 'An error occurred while adding the expense'}), 500

if __name__ == '__main__':
    app.run(debug=True)