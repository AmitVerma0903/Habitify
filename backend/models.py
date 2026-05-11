from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./habits.db" # Using SQLite for MVP

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    timezone = Column(String, default="UTC")
    created_at = Column(DateTime, default=datetime.utcnow)

class Habit(Base):
    __tablename__ = "habits"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, index=True)
    category = Column(String)
    color = Column(String)
    icon = Column(String)
    frequency = Column(String) # e.g. "daily", "weekly"
    created_at = Column(DateTime, default=datetime.utcnow)

class HabitLog(Base):
    __tablename__ = "habit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"))
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String) # "completed", "skipped", "failed"
    notes = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)
