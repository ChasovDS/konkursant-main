from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
import logging

# Файлы модуля Авторизации
from src.modules.auth import schemas, auth, utils, models
from src.modules.auth.schemas import UserLogin

# Файлы основного приложения
from src.config import settings

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

auth_router = APIRouter()


@auth_router.post("/register", response_model=schemas.User, tags=["Авторизация"])
async def register_user(user_in: schemas.UserCreate, db: AsyncSession = Depends(auth.get_db)):
    """
    Регистрация нового пользователя. Проверяет, существует ли пользователь с указанной электронной почтой.

    - **user_in**: Данные для создания нового пользователя.
    """
    user = await auth.get_user_by_email(db, user_in.email)
    if user:
        logger.warning("Попытка регистрации с уже существующей электронной почтой: %s", user_in.email)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Электронная почта уже зарегистрирована"
        )

    # Хэширование пароля перед сохранением
    user_data = user_in.dict()
    user_data.pop("password")  # Удаляем пароль из user_data
    user_in_db = models.User(**user_data, password_hash=utils.get_password_hash(user_in.password))
    db.add(user_in_db)
    await db.commit()
    await db.refresh(user_in_db)
    logger.info("Пользователь %s успешно зарегистрирован.", user_in.email)
    return user_in_db


@auth_router.post("/login", tags=["Авторизация"])
async def login_for_access_token(response: Response, form_data: UserLogin, db: AsyncSession = Depends(auth.get_db)):
    """
    Аутентификация пользователя и получение токена доступа.

    - **form_data**: Данные для входа (имя пользователя и пароль).
    """
    logger.debug(f"Данные формы для входа: {form_data}")
    user = await auth.authenticate_user(db, form_data.username, form_data.password)

    if not user:
        logger.error(f"Неверная попытка входа для пользователя {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
        )

    logger.info(f"Пользователь {user.email} успешно прошел аутентификацию.")

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = utils.create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)

    # Устанавливаем токен в бля cookie для улучшенной безопасности
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False)
    logger.info(f"Token установлен в cookie для пользователя {user.email}")

    return {"access_token": access_token, "token_type": "bearer"}


@auth_router.get("/users/me/", response_model=schemas.User, tags=["Авторизация"])
async def read_users_me(current_user: schemas.User = Depends(auth.get_current_user)):
    """
    Получение информации о текущем аутентифицированном пользователе.
    """
    return current_user


@auth_router.post("/logout", tags=["Авторизация"])
async def logout(response: Response):
    """
    Выход пользователя из системы, удаление токена доступа из бля cookie.
    """
    response.delete_cookie("access_token")
    logger.info("Пользователь успешно вышел из системы.")
    return {"message": "Successfully logged out"}


@auth_router.patch("/assign-role", tags=["Админ-панель"])
async def assign_role(email: str, role: str, current_user: schemas.User = Depends(auth.get_current_user),
                      db: AsyncSession = Depends(auth.get_db)):
    """
    Назначение роли пользователю. Доступно только для администраторов.

    - **email**: Электронная почта пользователя, которому назначается роль.
    - **role**: Роль, которая будет назначена пользователю.
    """
    if current_user.role != 'admin':
        logger.warning("Попытка назначения роли пользователем, который не является администратором.")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Необходимо быть администратором для назначения ролей")

    user = await auth.get_user_by_email(db, email)
    if not user:
        logger.error("Пользователь с электронной почтой %s не найден.", email)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")

    user.role = role
    await db.commit()  # Сохраняем изменения
    logger.info("Роль %s назначена пользователю %s", role, email)
    return {"message": f"Роль {role} назначена пользователю {email}"}
