from datetime import datetime
from app.extensions import db

class TenantProfile(db.Model):
    __tablename__ = "tenant_profiles"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)

    national_id = db.Column(db.String(50), nullable=True)
    emergency_contact_name = db.Column(db.String(120), nullable=True)
    emergency_contact_phone = db.Column(db.String(20), nullable=True)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship("User", back_populates="tenant_profile")

    # ✅ explicit relationship to leases
    leases = db.relationship(
        "Lease",
        back_populates="tenant",
        cascade="all, delete-orphan",
        lazy=True,
    )

    def __repr__(self) -> str:
        return f"<TenantProfile id={self.id} user_id={self.user_id}>"