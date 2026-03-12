from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies,
    jwt_required,
    get_jwt_identity,
)
from app.extensions import db
from app.models.user import User
from app.models.landlord import Landlord
from app.models.tenant import TenantProfile

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    """
    Body:
      {
        "full_name": "Roy Cheru",
        "phone": "07xxxxxxxx",
        "email": "roy@gmail.com",     # optional
        "password": "Pass1234",
        "role": "landlord"            # landlord|tenant (default landlord)
      }
    """
    data = request.get_json() or {}

    try:
        full_name = data["full_name"].strip()
        phone = data["phone"].strip()
        email = data.get("email")
        password = data["password"]
        role = data.get("role", "landlord").strip().lower()

        if role not in ("landlord", "tenant"):
            return jsonify({"error": "role must be landlord or tenant"}), 400

        if User.query.filter_by(phone=phone).first():
            return jsonify({"error": "Phone already exists"}), 400
        if email and User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already exists"}), 400

        user = User(full_name=full_name, phone=phone, email=email, role=role, is_active=True)
        user.set_password(password)

        db.session.add(user)
        db.session.flush()  # get user.id

        # auto-create role profile
        if role == "landlord":
            db.session.add(Landlord(user_id=user.id))
        else:
            db.session.add(TenantProfile(user_id=user.id))

        db.session.commit()

        return jsonify({"user": user.to_dict()}), 201

    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Something went wrong"}), 500


@auth_bp.post("/signin")
def signin():
    """
    Sign in using phone + password (email optional later).
    Body: { "phone": "07xxxx", "password": "..." }
    """
    data = request.get_json() or {}

    try:
        email = data["email"].strip()
        password = data["password"]

        user = User.query.filter_by(email=email).first()
        if not user or not user.is_active:
            return jsonify({"error": "Invalid credentials"}), 401

        if not user.check_password(password):
            return jsonify({"error": "Invalid credentials"}), 401

        access_token = create_access_token(identity=str(user.id))  # ✅ stringify
        print("Created access token for user_id:", user.id, "token:", access_token)
        refresh_token = create_refresh_token(identity=str(user.id))  # ✅ stringify

        resp = jsonify({"message": "Signed in", "user": user.to_dict()})
        set_access_cookies(resp, access_token)
        set_refresh_cookies(resp, refresh_token)
        return resp, 200

    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400


@auth_bp.post("/signout")
def signout():
    resp = jsonify({"message": "Signed out"})
    unset_jwt_cookies(resp)
    return resp, 200


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    """
    Uses refresh token cookie to generate a new access token cookie.
    """
    user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=user_id)

    resp = jsonify({"message": "Token refreshed"})
    set_access_cookies(resp, new_access_token)
    return resp, 200