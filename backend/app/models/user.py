from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True, index=True)
    phone = db.Column(db.String(20), unique=True, nullable=False, index=True)

    password_hash = db.Column(db.String(255), nullable=False)

    # admin, landlord, tenant
    role = db.Column(db.String(20), nullable=False, default="landlord", index=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ✅ One-to-one relationships
    landlord_profile = db.relationship(
        "Landlord",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    tenant_profile = db.relationship(
        "TenantProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "is_active": self.is_active,
        }

    def __repr__(self) -> str:
        return f"<User id={self.id} role={self.role}>"