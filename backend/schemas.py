from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator

ProgressStatus = Literal["not_started", "in_progress", "awaiting_client", "on_hold"]
AssessmentType = Literal["willow", "danzel"]


class AssessmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    customer: str = Field(..., min_length=1, max_length=255)
    certification_body: str = Field(..., min_length=1, max_length=255)
    company_size: str = Field(..., min_length=1, max_length=50)
    assessment_type: AssessmentType = "willow"
    start_date: date
    end_date: date
    progress_status: ProgressStatus = "not_started"
    notes: str | None = None

    @model_validator(mode="after")
    def end_date_not_before_start(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class AssessmentCreate(AssessmentBase):
    pass


class AssessmentUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    customer: str | None = Field(None, min_length=1, max_length=255)
    certification_body: str | None = Field(None, min_length=1, max_length=255)
    company_size: str | None = Field(None, min_length=1, max_length=50)
    assessment_type: AssessmentType | None = None
    start_date: date | None = None
    end_date: date | None = None
    progress_status: ProgressStatus | None = None
    completed_at: datetime | None = None
    notes: str | None = None

    @model_validator(mode="after")
    def end_date_not_before_start(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class AssessmentResponse(AssessmentBase):
    id: int
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}