from flask import Blueprint, jsonify, request
from app.database import get_db_connection

expense_bp = Blueprint('expense', __name__)

@expense_bp.route('/stores', methods=['GET'])
def get_stores():
    conn = get_db_connection()
    stores = conn.execute('SELECT name FROM stores').fetchall()
    conn.close()
    return jsonify({"stores": [dict(store) for store in stores]})

@expense_bp.route('/items', methods=['GET'])
def get_items():
    conn = get_db_connection()
    items = conn.execute('SELECT name FROM items').fetchall()
    conn.close()
    return jsonify({"items": [dict(item) for item in items]})

@expense_bp.route('/expenses', methods=['GET'])
def get_expenses():
    user_name = request.args.get('user')
    if not user_name:
        return jsonify({'error': 'User is required'}), 400
    conn = get_db_connection()
    expenses = conn.execute('SELECT * FROM expenses WHERE user_name = ?', (user_name,)).fetchall()
    conn.close()
    expenses = [dict(expense) for expense in expenses]
    return jsonify(expenses=expenses)

@expense_bp.route('/add_expense', methods=['POST'])
def add_expense():
    data = request.get_json()
    date = data.get('date')
    store_name = data.get('store')
    item_name = data.get('item')
    quantity = data.get('quantity')
    price = data.get('price')
    total = data.get('total')
    bucket = data.get('bucket')
    user_name = data.get('user')

    if not all([date, store_name, item_name, quantity, price, total, bucket, user_name]):
        return jsonify({'error': 'All fields are required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO expenses (user_name, date, store_name, item_name, quantity, price, total, bucket) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            (user_name, date, store_name, item_name, quantity, price, total, bucket)
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'Expense added successfully!'})
    except Exception as e:
        return jsonify({'error': f'An error occurred while adding the expense: {str(e)}'}), 500

@expense_bp.route('/edit_expense', methods=['PUT'])
def edit_expense():
    data = request.get_json()
    expense_id = data.get('id')
    date = data.get('date')
    store_name = data.get('store')
    item_name = data.get('item')
    quantity = data.get('quantity')
    price = data.get('price')
    total = data.get('total')
    bucket = data.get('bucket')
    user_name = data.get('user')

    if not expense_id:
        return jsonify({'error': 'Expense ID is required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            '''UPDATE expenses SET date=?, store_name=?, item_name=?, quantity=?, price=?, total=?, bucket=?, user_name=? WHERE id=?''',
            (date, store_name, item_name, quantity, price, total, bucket, user_name, expense_id)
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'Expense updated successfully!'})
    except Exception as e:
        return jsonify({'error': f'An error occurred while updating the expense: {str(e)}'}), 500

@expense_bp.route('/delete_expense', methods=['DELETE'])
def delete_expense():
    data = request.get_json()
    expense_id = data.get('id')
    if not expense_id:
        return jsonify({'error': 'Expense ID is required'}), 400
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM expenses WHERE id=?', (expense_id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Expense deleted successfully!'})
    except Exception as e:
        return jsonify({'error': f'An error occurred while deleting the expense: {str(e)}'}), 500

@expense_bp.route('/income/total_cash', methods=['GET'])
def get_total_cash_income():
    conn = get_db_connection()
    result = conn.execute("""
        SELECT 
            IFNULL((SELECT SUM(amount) FROM income WHERE type = 'Cash'), 0) - 
            IFNULL((SELECT SUM(total) FROM expenses WHERE bucket = 'Cash'), 0) 
            AS total
    """).fetchone()
    conn.close()
    total = result['total'] if result['total'] is not None else 0
    return jsonify({'total_cash_income': total})

