# pyrefly: ignore [missing-import]
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

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    timezone: Optional[str] = None

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

# --- Analytics Schemas ---
class HabitStats(BaseModel):
    habit_id: int
    title: str
    current_streak: int
    completion_rate: float # percentage
    total_completions: int

class AnalyticsSummary(BaseModel):
    total_habits: int
    completed_today: int
    average_completion_rate: float
    best_streak: int
    productivity_score: int # 0-100
    habit_stats: List[HabitStats]
