from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

import models, schemas, auth
from models import User, Habit, HabitLog
from auth import get_db, get_current_user

app = FastAPI(title="Habit Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Authentication Routes ---
@app.post("/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = User(name=user.name, email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=schemas.UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# --- Habit Routes ---
@app.post("/habits", response_model=schemas.HabitResponse)
def create_habit(habit: schemas.HabitCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_habit = Habit(**habit.model_dump(), user_id=current_user.id)
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)
    return new_habit

@app.get("/habits", response_model=List[schemas.HabitResponse])
def get_habits(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Habit).filter(Habit.user_id == current_user.id).all()

@app.get("/habits/today", response_model=list)
def get_todays_habits(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habits = db.query(Habit).filter(Habit.user_id == current_user.id).all()
    today = datetime.utcnow().date()
    
    result = []
    for h in habits:
        # Check if logged today
        log = db.query(HabitLog).filter(
            HabitLog.habit_id == h.id
        ).order_by(HabitLog.date.desc()).first()
        
        is_completed_today = False
        if log and log.date.date() == today and log.status == "completed":
            is_completed_today = True
            
        result.append({
            "id": h.id,
            "title": h.title,
            "category": h.category,
            "color": h.color,
            "icon": h.icon,
            "frequency": h.frequency,
            "completed": is_completed_today
        })
    return result

@app.post("/habits/{habit_id}/log", response_model=schemas.HabitLogResponse)
def log_habit(habit_id: int, log: schemas.HabitLogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify habit belongs to user
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
        
    new_log = HabitLog(habit_id=habit_id, status=log.status, notes=log.notes)
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@app.get("/")
def read_root():
    return {"message": "Welcome to Habit Tracker API"}
