from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---- Auth ----
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(default="", max_length=255)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    name: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---- Resumes ----
class ResumeBase(BaseModel):
    title: str = Field(default="無題の経歴書", max_length=255)
    data: dict[str, Any] = Field(default_factory=dict)


class ResumeCreate(ResumeBase):
    pass


class ResumeUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    data: dict[str, Any] | None = None


class ResumeSummary(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime


class ResumeOut(ResumeSummary):
    data: dict[str, Any]
