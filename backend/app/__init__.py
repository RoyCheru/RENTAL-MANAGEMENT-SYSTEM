from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.extensions import db, jwt, migrate
from app.blueprints import register_blueprints

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    
    from app.models import user, landlord, tenant, property, unit, lease, payment, rent_charge  # noqa: F401
    # print("DB:", app.config["SQLALCHEMY_DATABASE_URI"])

    # Enable CORS (configure origins as needed)
    CORS(
    app,
    supports_credentials=True,
    resources={
        r"/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173"]
        }
    }
)
    register_blueprints(app)
    @app.get("/health")
    def health():
        return {"status": "ok"}, 200


    return app