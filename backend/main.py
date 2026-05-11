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

@app.put("/auth/me", response_model=schemas.UserResponse)
def update_user_me(user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.email is not None:
        # Check if email is already taken
        if user_update.email != current_user.email:
            db_user = db.query(User).filter(User.email == user_update.email).first()
            if db_user:
                raise HTTPException(status_code=400, detail="Email already registered")
            current_user.email = user_update.email
    if user_update.timezone is not None:
        current_user.timezone = user_update.timezone
        
    db.commit()
    db.refresh(current_user)
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

# --- Analytics Logic ---
def calculate_streak(habit_id: int, db: Session):
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.status == "completed"
    ).order_by(HabitLog.date.desc()).all()
    
    if not logs:
        return 0
    
    streak = 0
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)
    
    # Check if the most recent log is today or yesterday
    last_log_date = logs[0].date.date()
    if last_log_date < yesterday:
        return 0
        
    current_date = last_log_date
    for log in logs:
        log_date = log.date.date()
        if log_date == current_date:
            streak += 1
            current_date -= timedelta(days=1)
        elif log_date < current_date:
            break # Gap found
            
    return streak

@app.get("/analytics/summary", response_model=schemas.AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habits = db.query(Habit).filter(Habit.user_id == current_user.id).all()
    today = datetime.utcnow().date()
    
    habit_stats = []
    total_completions = 0
    completed_today = 0
    max_streak = 0
    
    for h in habits:
        logs = db.query(HabitLog).filter(HabitLog.habit_id == h.id).all()
        completed_logs = [l for l in logs if l.status == "completed"]
        
        # Streak
        streak = calculate_streak(h.id, db)
        if streak > max_streak:
            max_streak = streak
            
        # Completion Rate
        days_since_creation = (datetime.utcnow() - h.created_at).days + 1
        completion_rate = (len(completed_logs) / days_since_creation) * 100 if days_since_creation > 0 else 0
        
        # Completed Today
        if any(l.date.date() == today and l.status == "completed" for l in logs):
            completed_today += 1
            
        total_completions += len(completed_logs)
        
        habit_stats.append(schemas.HabitStats(
            habit_id=h.id,
            title=h.title,
            current_streak=streak,
            completion_rate=round(completion_rate, 1),
            total_completions=len(completed_logs)
        ))
        
    avg_completion_rate = sum(h.completion_rate for h in habit_stats) / len(habits) if habits else 0
    
    # Productivity Score (Simple heuristic)
    # 40% Completion Rate, 40% Today's progress, 20% Streak consistency
    today_progress = (completed_today / len(habits) * 100) if habits else 0
    streak_score = min(max_streak * 5, 100) # 20 days for full streak score
    productivity_score = (avg_completion_rate * 0.4) + (today_progress * 0.4) + (streak_score * 0.2)

    return schemas.AnalyticsSummary(
        total_habits=len(habits),
        completed_today=completed_today,
        average_completion_rate=round(avg_completion_rate, 1),
        best_streak=max_streak,
        productivity_score=int(productivity_score),
        habit_stats=habit_stats
    )

@app.get("/ai/coach/insight")
def get_ai_insight(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch summary for context
    summary = get_analytics_summary(db, current_user)
    
    if summary.total_habits == 0:
        return {"insight": "Welcome! The journey of a thousand miles begins with a single habit. Let's create your first goal! ✨"}
    
    if summary.completed_today == summary.total_habits:
        return {"insight": "Perfect score! 🏆 You've crushed all your habits today. Take some time to reflect on your success!"}
        
    if summary.productivity_score > 80:
        return {"insight": "You're on fire! 🚀 Your consistency is inspiring. Keep this momentum going and you'll reach your goals in no time!"}
        
    if summary.best_streak > 5:
        return {"insight": f"Impressive {summary.best_streak}-day streak! 🔥 Don't let it break today. You've worked too hard to stop now!"}
        
    if summary.completed_today == 0:
        return {"insight": "Today is a fresh start. 🎯 Try to complete just one habit right now to build some momentum. You've got this!"}
        
    return {"insight": "You're doing great! Try to complete your remaining habits to maintain your momentum. Consistency is the key to mastery. 💪"}

@app.get("/analytics/heatmap")
def get_heatmap_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Get all habits for the user
    habit_ids = [h.id for h in db.query(Habit).filter(Habit.user_id == current_user.id).all()]
    
    # Get logs for the last 90 days
    ninety_days_ago = datetime.utcnow() - timedelta(days=90)
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id.in_(habit_ids),
        HabitLog.date >= ninety_days_ago,
        HabitLog.status == "completed"
    ).all()
    
    # Aggregate by date
    heatmap = {}
    for log in logs:
        date_str = log.date.date().isoformat()
        heatmap[date_str] = heatmap.get(date_str, 0) + 1
        
    return heatmap

@app.get("/analytics/trends")
def get_trends_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Last 7 days
    dates = [(datetime.utcnow() - timedelta(days=i)).date() for i in range(6, -1, -1)]
    
    habit_ids = [h.id for h in db.query(Habit).filter(Habit.user_id == current_user.id).all()]
    
    trends = []
    for d in dates:
        start_of_day = datetime.combine(d, datetime.min.time())
        end_of_day = datetime.combine(d, datetime.max.time())
        
        count = db.query(HabitLog).filter(
            HabitLog.habit_id.in_(habit_ids),
            HabitLog.date >= start_of_day,
            HabitLog.date <= end_of_day,
            HabitLog.status == "completed"
        ).count()
        
        trends.append({
            "date": d.strftime("%b %d"),
            "completed": count
        })
        
    return trends

@app.get("/analytics/calendar")
def get_calendar_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Return all completions for the current user grouped by date
    habit_ids = [h.id for h in db.query(Habit).filter(Habit.user_id == current_user.id).all()]
    
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id.in_(habit_ids),
        HabitLog.status == "completed"
    ).all()
    
    calendar_data = {}
    for log in logs:
        date_str = log.date.date().isoformat()
        if date_str not in calendar_data:
            calendar_data[date_str] = []
        
        # Find habit title for this log
        habit = db.query(Habit).filter(Habit.id == log.habit_id).first()
        calendar_data[date_str].append({
            "id": habit.id,
            "title": habit.title,
            "color": habit.color,
            "icon": habit.icon
        })
        
    return calendar_data

@app.get("/ai/recommendations")
def get_habit_recommendations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Predefined recommendations pool
    recommendations_pool = [
        {"title": "Morning Meditation", "category": "Health", "icon": "🧘‍♀️", "color": "text-emerald-400"},
        {"title": "Read for 30 Mins", "category": "Learning", "icon": "📚", "color": "text-blue-400"},
        {"title": "Drink 2L Water", "category": "Health", "icon": "💧", "color": "text-emerald-400"},
        {"title": "Code for 1 Hour", "category": "Learning", "icon": "💻", "color": "text-blue-400"},
        {"title": "Daily Journaling", "category": "Productivity", "icon": "✍️", "color": "text-purple-400"},
        {"title": "Track Expenses", "category": "Finance", "icon": "💰", "color": "text-orange-400"},
        {"title": "10-Min Workout", "category": "Health", "icon": "🏃‍♂️", "color": "text-emerald-400"},
        {"title": "Inbox Zero", "category": "Productivity", "icon": "🎯", "color": "text-purple-400"},
    ]
    
    # Get user's existing habit titles to avoid duplicates
    user_habits = [h.title.lower() for h in db.query(Habit).filter(Habit.user_id == current_user.id).all()]
    
    # Filter out existing habits
    suggestions = [r for r in recommendations_pool if r["title"].lower() not in user_habits]
    
    # Return top 3 suggestions
    import random
    if len(suggestions) > 3:
        suggestions = random.sample(suggestions, 3)
        
    return suggestions

@app.get("/")
def read_root():
    return {"message": "Welcome to Habit Tracker API"}
