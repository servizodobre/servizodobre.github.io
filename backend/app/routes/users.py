from flask import Blueprint

users_bp = Blueprint('users', __name__)

@users_bp.route('/')
def users_home():
    return "Users Home Page"

