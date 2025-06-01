from flask import Blueprint, request, jsonify

users_bp = Blueprint('users', __name__)

# Mock database for demonstration purposes
users = [
    {"username": "admin", "password": "admin123", "category": "admin"},
    {"username": "user1", "password": "user123", "category": "user"}
]

@users_bp.route('/users', methods=['GET'])
def get_users():
    return jsonify({"users": users})

@users_bp.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    category = data.get('category')

    if not username or not password or not category:
        return jsonify({"message": "All fields are required."}), 400

    users.append({"username": username, "password": password, "category": category})
    return jsonify({"message": "User added successfully!"})

@users_bp.route('/edit_user', methods=['PUT'])
def edit_user():
    data = request.get_json()
    old_username = data.get('oldUsername')
    new_username = data.get('newUsername')
    password = data.get('password')
    category = data.get('category')

    for user in users:
        if user['username'] == old_username:
            if new_username:
                user['username'] = new_username
            if password:
                user['password'] = password
            if category:
                user['category'] = category
            return jsonify({"message": "User updated successfully!"})

    return jsonify({"message": "User not found."}), 404

@users_bp.route('/delete_user', methods=['DELETE'])
def delete_user():
    data = request.get_json()
    username = data.get('username')

    for user in users:
        if user['username'] == username:
            users.remove(user)
            return jsonify({"message": "User deleted successfully!"})

    return jsonify({"message": "User not found."}), 404


