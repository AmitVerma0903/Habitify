from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- User Schemas ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    timezone: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Habit Schemas ---
class HabitCreate(BaseModel):
    title: str
    category: str
    color: str = "text-indigo-400"
    icon: str = "🎯"
    frequency: str = "daily"

class HabitResponse(BaseModel):
    id: int
    user_id: int
    title: str
    category: str
    color: str
    icon: str
    frequency: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Habit Log Schemas ---
class HabitLogCreate(BaseModel):
    status: str # "completed", "skipped", "failed"
    notes: Optional[str] = None

class HabitLogResponse(BaseModel):
    id: int
    habit_id: int
    date: datetime
    status: str
    notes: Optional[str]

    class Config:
        from_attributes = True
