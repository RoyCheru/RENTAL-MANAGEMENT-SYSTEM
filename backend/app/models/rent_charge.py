from datetime import datetime, date
from app.extensions import db

class RentCharge(db.Model):
    __tablename__ = "rent_charges"

    id = db.Column(db.Integer, primary_key=True)

    lease_id = db.Column(db.Integer, db.ForeignKey("leases.id"), nullable=False, index=True)

    period_year = db.Column(db.Integer, nullable=False)   # e.g. 2026
    period_month = db.Column(db.Integer, nullable=False)  # e.g. 2

    amount_due = db.Column(db.Numeric(12, 2), nullable=False)
    late_fee = db.Column(db.Numeric(12, 2), nullable=False, default=0)

    due_date = db.Column(db.Date, nullable=False, default=date.today)

    # unpaid, partial, paid, overdue
    status = db.Column(db.String(20), nullable=False, default="unpaid", index=True)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ✅ relationships
    lease = db.relationship("Lease", back_populates="rent_charges")

    payments = db.relationship(
        "Payment",
        back_populates="rent_charge",
        cascade="all, delete-orphan",
        lazy=True,
    )

    # Ensure 1 charge per lease per month
    __table_args__ = (
        db.UniqueConstraint("lease_id", "period_year", "period_month", name="uq_rent_charge_lease_period"),
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "lease_id": self.lease_id,
            "period_year": self.period_year,
            "period_month": self.period_month,
            "amount_due": float(self.amount_due),
            "late_fee": float(self.late_fee),
            "due_date": self.due_date.isoformat(),
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    def __repr__(self) -> str:
        return f"<RentCharge id={self.id} lease_id={self.lease_id} {self.period_year}-{self.period_month} status={self.status}>"