from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.user import User
from app.models.tenant import TenantProfile

tenants_bp = Blueprint("tenants", __name__, url_prefix="/api/tenants")


@tenants_bp.post("")
@jwt_required()
def create_tenant():
    """
    Create a tenant (creates User + TenantProfile)
    Body:
      {
        "full_name": "John Doe",
        "phone": "07xxxxxxxx",
        "email": "john@gmail.com",        # optional
        "password": "Pass1234",           # optional (if omitted, you can set a default)
        "national_id": "12345678",        # optional
        "emergency_contact_name": "Mary", # optional
        "emergency_contact_phone": "07..."# optional
      }
    """
    data = request.get_json() or {}

    try:
        full_name = data["full_name"].strip()
        phone = data["phone"].strip()
        email = data.get("email")
        password = data.get("password", "Tenant1234")  # MVP default; you can improve later

        # basic duplicates check
        if User.query.filter_by(phone=phone).first():
            return jsonify({"error": "Phone already exists"}), 400
        if email and User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already exists"}), 400

        user = User(
            full_name=full_name,
            phone=phone,
            email=email,
            role="tenant",
            is_active=True
        )
        user.set_password(password)

        db.session.add(user)
        db.session.flush()  # gives user.id without committing yet

        profile = TenantProfile(
            user_id=user.id,
            national_id=data.get("national_id"),
            emergency_contact_name=data.get("emergency_contact_name"),
            emergency_contact_phone=data.get("emergency_contact_phone"),
        )

        db.session.add(profile)
        db.session.commit()

        return jsonify({
            "tenant": {
                "tenant_id": profile.id,
                "user": user.to_dict(),
                "profile": {
                    "national_id": profile.national_id,
                    "emergency_contact_name": profile.emergency_contact_name,
                    "emergency_contact_phone": profile.emergency_contact_phone,
                }
            }
        }), 201

    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@tenants_bp.get("")
@jwt_required()
def list_tenants():
    """
    List tenants
    Query params:
      - q=search text (name/phone/email)
      - page=1
      - per_page=20
    """
    q = request.args.get("q", "").strip()
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=20, type=int)

    query = TenantProfile.query.join(User, TenantProfile.user_id == User.id)

    if q:
        like = f"%{q}%"
        query = query.filter(
            (User.full_name.ilike(like)) |
            (User.phone.ilike(like)) |
            (User.email.ilike(like))
        )

    query = query.order_by(User.full_name.asc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    items = []
    for profile in pagination.items:
        user = profile.user
        items.append({
            "tenant_id": profile.id,
            "user": user.to_dict(),
            "profile": {
                "national_id": profile.national_id,
                "emergency_contact_name": profile.emergency_contact_name,
                "emergency_contact_phone": profile.emergency_contact_phone,
            }
        })

    return jsonify({
        "items": items,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages,
    }), 200


@tenants_bp.get("/<int:tenant_id>")
@jwt_required()
def get_tenant(tenant_id: int):
    profile = TenantProfile.query.get_or_404(tenant_id)
    user = profile.user

    return jsonify({
        "tenant": {
            "tenant_id": profile.id,
            "user": user.to_dict(),
            "profile": {
                "national_id": profile.national_id,
                "emergency_contact_name": profile.emergency_contact_name,
                "emergency_contact_phone": profile.emergency_contact_phone,
            }
        }
    }), 200


@tenants_bp.put("/<int:tenant_id>")
@jwt_required()
def update_tenant(tenant_id: int):
    """
    Update tenant user/profile details.
    Body can include:
      full_name, phone, email, is_active,
      national_id, emergency_contact_name, emergency_contact_phone
    """
    profile = TenantProfile.query.get_or_404(tenant_id)
    user = profile.user
    data = request.get_json() or {}

    # Update user fields
    if "full_name" in data:
        user.full_name = data["full_name"].strip()

    if "phone" in data:
        new_phone = data["phone"].strip()
        existing = User.query.filter(User.phone == new_phone, User.id != user.id).first()
        if existing:
            return jsonify({"error": "Phone already exists"}), 400
        user.phone = new_phone

    if "email" in data:
        new_email = data["email"]
        if new_email:
            existing = User.query.filter(User.email == new_email, User.id != user.id).first()
            if existing:
                return jsonify({"error": "Email already exists"}), 400
        user.email = new_email

    if "is_active" in data:
        user.is_active = bool(data["is_active"])

    # Update profile fields
    if "national_id" in data:
        profile.national_id = data["national_id"]

    if "emergency_contact_name" in data:
        profile.emergency_contact_name = data["emergency_contact_name"]

    if "emergency_contact_phone" in data:
        profile.emergency_contact_phone = data["emergency_contact_phone"]

    db.session.commit()

    return jsonify({
        "tenant": {
            "tenant_id": profile.id,
            "user": user.to_dict(),
            "profile": {
                "national_id": profile.national_id,
                "emergency_contact_name": profile.emergency_contact_name,
                "emergency_contact_phone": profile.emergency_contact_phone,
            }
        }
    }), 200


@tenants_bp.delete("/<int:tenant_id>")
@jwt_required()
def delete_tenant(tenant_id: int):
    """
    Soft delete approach is best, but MVP can delete.
    Safer: deactivate user.
    """
    profile = TenantProfile.query.get_or_404(tenant_id)
    user = profile.user

    # Safer than hard delete (keeps history for leases/payments)
    user.is_active = False
    db.session.commit()

    return jsonify({"message": "Tenant deactivated"}), 200