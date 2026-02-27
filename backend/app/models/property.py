from datetime import datetime
from app.extensions import db

class Property(db.Model):
    __tablename__ = "properties"

    id = db.Column(db.Integer, primary_key=True)

    landlord_id = db.Column(db.Integer, db.ForeignKey("landlords.id"), nullable=False, index=True)

    name = db.Column(db.String(120), nullable=False)
    property_type = db.Column(db.String(50), nullable=False, default="apartment")

    country = db.Column(db.String(60), nullable=True, default="Kenya")
    city = db.Column(db.String(80), nullable=True)
    area = db.Column(db.String(120), nullable=True)
    address = db.Column(db.String(255), nullable=True)

    notes = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ✅ explicit relationships
    landlord = db.relationship("Landlord", back_populates="properties")

    units = db.relationship(
        "Unit",
        back_populates="property",
        cascade="all, delete-orphan",
        lazy=True,
    )

    def __repr__(self) -> str:
        return f"<Property id={self.id} name={self.name} landlord_id={self.landlord_id}>"