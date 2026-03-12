from datetime import datetime, date
from app.extensions import db

class Lease(db.Model):
    __tablename__ = "leases"

    id = db.Column(db.Integer, primary_key=True)

    unit_id = db.Column(db.Integer, db.ForeignKey("units.id"), nullable=False, index=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey("tenant_profiles.id"), nullable=False, index=True)

    start_date = db.Column(db.Date, nullable=False, default=date.today)
    end_date = db.Column(db.Date, nullable=True)

    rent_amount_at_start = db.Column(db.Numeric(12, 2), nullable=False)
    due_day = db.Column(db.Integer, nullable=False, default=5)

    status = db.Column(db.String(20), nullable=False, default="active", index=True)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ✅ explicit relationships
    unit = db.relationship("Unit", back_populates="leases")
    tenant = db.relationship("TenantProfile", back_populates="leases")
    rent_charges = db.relationship(
    "RentCharge",
    back_populates="lease",
    cascade="all, delete-orphan",
    lazy=True,
    )

    payments = db.relationship(
        "Payment",
        back_populates="lease",
        cascade="all, delete-orphan",
        lazy=True,
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "unit_id": self.unit_id,
            "tenant_id": self.tenant_id,
            "tenant_name": self.tenant.name if self.tenant else None,
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "rent_amount_at_start": float(self.rent_amount_at_start),
            "due_day": self.due_day,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    def __repr__(self) -> str:
        return f"<Lease id={self.id} unit_id={self.unit_id} tenant_id={self.tenant_id} status={self.status}>"