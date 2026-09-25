from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ApplicationBase(BaseModel):
    company_name: str = Field(min_length=1, max_length=150)
    job_title: str = Field(min_length=1, max_length=150)
    job_type: str | None = Field(default=None, max_length=50)
    location: str | None = Field(default=None, max_length=150)
    application_url: HttpUrl | None = None
    status: str = "Applied"
    priority: str = "Medium"
    applied_date: date | None = None
    deadline: date | None = None
    salary_range: str | None = Field(default=None, max_length=100)
    notes: str | None = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    company_name: str | None = Field(default=None, min_length=1, max_length=150)
    job_title: str | None = Field(default=None, min_length=1, max_length=150)
    job_type: str | None = Field(default=None, max_length=50)
    location: str | None = Field(default=None, max_length=150)
    application_url: HttpUrl | None = None
    status: str | None = None
    priority: str | None = None
    applied_date: date | None = None
    deadline: date | None = None
    salary_range: str | None = Field(default=None, max_length=100)
    notes: str | None = None


class ApplicationResponse(ApplicationBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)