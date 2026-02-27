from datetime import datetime
from app.extensions import db

class Landlord(db.Model):
    __tablename__ = "landlords"

    id = db.Column(db.Integer, primary_key=True)

    # ✅ one-to-one link to users table
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)

    business_name = db.Column(db.String(120), nullable=True)
    id_number = db.Column(db.String(50), nullable=True)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # relationship back to User
    user = db.relationship("User", back_populates="landlord_profile")
    properties = db.relationship(
        "Property",
        back_populates="landlord",
        cascade="all, delete-orphan",
        lazy=True,
    )

    def __repr__(self) -> str:
        return f"<Landlord id={self.id} user_id={self.user_id}>"