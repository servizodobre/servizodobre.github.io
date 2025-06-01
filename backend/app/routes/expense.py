from flask import Blueprint, request, jsonify

expense_bp = Blueprint('expense', __name__)

# Mock data for demonstration purposes
stores = [{"name": "Supermarket"}, {"name": "Gas Station"}, {"name": "Electronics Store"}]
items = [{"name": "Milk"}, {"name": "Fuel"}, {"name": "Laptop"}]


@expense_bp.route('/stores', methods=['GET'])
def get_stores():
    return jsonify({"stores": stores})

@expense_bp.route('/items', methods=['GET'])
def get_items():
    return jsonify({"items": items})

