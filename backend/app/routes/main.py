from flask import Blueprint, render_template

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    print("Rendering index.html")
    return render_template('index.html')

