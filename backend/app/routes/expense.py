from flask import Blueprint, jsonify
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

