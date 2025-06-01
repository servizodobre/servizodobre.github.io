from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    # Allow requests from your frontend's domain
    CORS(app, resources={r"/*": {"origins": ["https://servizodobre.com"]}})

    # Register Blueprints
    from app.routes.main import main_bp
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.expense import expense_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(users_bp, url_prefix='/users')
    app.register_blueprint(expense_bp, url_prefix='/expense')

    return app

