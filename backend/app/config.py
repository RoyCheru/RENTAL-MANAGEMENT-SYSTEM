import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key")

    # Start with SQLite, switch later by setting DATABASE_URL to Postgres
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///rental_mgmt.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT in cookies (recommended)
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_ACCESS_COOKIE_NAME = "access_token_cookie"
    JWT_REFRESH_COOKIE_NAME = "refresh_token_cookie"
    JWT_COOKIE_CSRF_PROTECT = False  # set True later if you want CSRF protection
    JWT_COOKIE_SECURE = False        # True in production (HTTPS)
    JWT_COOKIE_SAMESITE = "Lax"