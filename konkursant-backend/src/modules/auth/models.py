from sqlalchemy import Boolean, Column, String, Integer, Enum, DateTime, func
from sqlalchemy.orm import relationship
import enum

# Файлы основного приложения
from src.database import Base, metadata

# Определение модели User
class User(Base):
    __tablename__ = 'users'

    id_user = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Integer, default=True)
    role = Column(String, nullable=False, default='user')
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    projects = relationship("Project", back_populates="owner")
    reviews = relationship("Review", back_populates="reviewer")
