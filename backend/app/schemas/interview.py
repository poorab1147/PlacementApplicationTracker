from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class InterviewBase(BaseModel):
    round_name: str = Field(min_length=1, max_length=100)
    interview_type: str | None = Field(default=None, max_length=50)
    scheduled_at: datetime | None = None
    interviewer: str | None = Field(default=None, max_length=150)
    result: str | None = Field(default=None, max_length=50)
    notes: str | None = None


class InterviewCreate(InterviewBase):
    pass


class InterviewUpdate(BaseModel):
    round_name: str | None = Field(default=None, min_length=1, max_length=100)
    interview_type: str | None = Field(default=None, max_length=50)
    scheduled_at: datetime | None = None
    interviewer: str | None = Field(default=None, max_length=150)
    result: str | None = Field(default=None, max_length=50)
    notes: str | None = None


class InterviewResponse(InterviewBase):
    id: int
    application_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)