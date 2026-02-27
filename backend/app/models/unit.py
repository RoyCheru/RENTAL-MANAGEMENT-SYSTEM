from datetime import datetime
from app.extensions import db

class Unit(db.Model):
    __tablename__ = "units"

    id = db.Column(db.Integer, primary_key=True)

    property_id = db.Column(db.Integer, db.ForeignKey("properties.id"), nullable=False, index=True)
    unit_code = db.Column(db.String(50), nullable=False)

    floor = db.Column(db.String(20), nullable=True)
    bedrooms = db.Column(db.Integer, nullable=True)

    rent_amount = db.Column(db.Numeric(12, 2), nullable=False)
    deposit_amount = db.Column(db.Numeric(12, 2), nullable=True)

    status = db.Column(db.String(20), nullable=False, default="vacant", index=True)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ✅ explicit relationship back to Property
    property = db.relationship("Property", back_populates="units")

    # ✅ explicit relationship to Lease (one unit, many leases over time)
    leases = db.relationship(
        "Lease",
        back_populates="unit",
        cascade="all, delete-orphan",
        lazy=True,
    )

    __table_args__ = (
        db.UniqueConstraint("property_id", "unit_code", name="uq_units_property_unit_code"),
    )

    def __repr__(self) -> str:
        return f"<Unit id={self.id} code={self.unit_code} property_id={self.property_id} status={self.status}>"