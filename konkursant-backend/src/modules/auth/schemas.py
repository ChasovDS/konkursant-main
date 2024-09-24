from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import enum

# Определяем роли пользователя
class UserRole(str, enum.Enum):
    user = "user"         # Обычный пользователь
    reviewer = "reviewer" # Рецензент
    admin = "admin"       # Администратор

# Базовая схема пользователя для создателей и обновления
class UserBase(BaseModel):
    full_name: str             # Полное имя пользователя
    email: EmailStr            # Электронная почта пользователя

# Схема для создания пользователя
class UserCreate(UserBase):
    password: str              # Пароль пользователя для регистрации

# Схема для обновления пользователя
class UserUpdate(UserBase):
    password: Optional[str] = None  # Пароль пользователя (необязательный)

# Базовая схема пользователя в базе данных
class UserInDBBase(UserBase):
    id_user: int               # Уникальный идентификатор пользователя
    role: UserRole             # Роль пользователя
    created_at: datetime       # Дата и время создания записи
    updated_at: datetime       # Дата и время последнего обновления записи

    class Config:
        from_attributes = True  # Позволяет Pydantic автоматически использовать атрибуты класса

# Полная схема пользователя с данными из базы данных
class User(UserInDBBase):
    pass

# Схема пользователя в базе данных, содержащая зашифрованный пароль
class UserInDB(UserInDBBase):
    password_hash: str        # Зашифрованный пароль пользователя

# Схема токена доступа
class Token(BaseModel):
    access_token: str         # Токен доступа
    token_type: str           # Тип токена (например, "bearer")

# Схема данных токена, возвращаемых после аутентификации
class TokenData(BaseModel):
    email: Optional[str] = None  # Электронная почта пользователя (необязательное поле)

# Схема для входа пользователя
class UserLogin(BaseModel):
    username: EmailStr         # Электронная почта пользователя
    password: str              # Пароль пользователя
