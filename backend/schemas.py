from datetime import date, datetime

from pydantic import BaseModel, Field


class AssessmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    customer: str = Field(..., min_length=1, max_length=255)
    certification_body: str = Field(..., min_length=1, max_length=255)
    company_size: str = Field(..., min_length=1, max_length=50)
    assessment_date: date
    notes: str | None = None


class AssessmentCreate(AssessmentBase):
    pass


class AssessmentUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    customer: str | None = Field(None, min_length=1, max_length=255)
    certification_body: str | None = Field(None, min_length=1, max_length=255)
    company_size: str | None = Field(None, min_length=1, max_length=50)
    assessment_date: date | None = None
    notes: str | None = None


class AssessmentResponse(AssessmentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}