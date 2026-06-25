from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base

PROGRESS_STATUSES = (
    "not_started",
    "in_progress",
    "awaiting_client",
    "on_hold",
)

ASSESSMENT_TYPES = ("willow", "danzel")


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer: Mapped[str] = mapped_column(String(255), nullable=False)
    certification_body: Mapped[str] = mapped_column(String(255), nullable=False)
    company_size: Mapped[str] = mapped_column(String(50), nullable=False)
    assessment_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default="willow"
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    end_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    progress_status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="not_started"
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    sample_sampled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    sample_agents: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    sample_invites: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )