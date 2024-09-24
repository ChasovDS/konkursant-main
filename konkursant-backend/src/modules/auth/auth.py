# Стандартные импорты
import logging
from fastapi import Request, Response, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from starlette.status import HTTP_403_FORBIDDEN
import bcrypt

# Файлы модуля Авторизации
from src.modules.auth import models, schemas, utils

# Файлы основного приложения
from src.database import async_session
from src.config import settings

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_db():
    """
    Генератор для создания асинхронной сессии базы данных.
    """
    async with async_session() as session:
        yield session


async def get_user(db: AsyncSession, user_id: int):
    """
    Получение пользователя из базы данных по его ID.

    - user_id: ID пользователя.
    """
    result = await db.execute(select(models.User).filter(models.User.id_user == user_id))
    return result.scalars().first()


async def get_user_by_email(db: AsyncSession, email: str):
    """
    Получение пользователя из базы данных по его электронной почте.

    - email: Электронная почта пользователя.
    """
    logger.info(f"Поиск пользователя по электронной почте: {email}")
    result = await db.execute(select(models.User).filter(models.User.email == email))
    user = result.scalars().first()

    if user:
        logger.info(f"Пользователь {user.email} найден.")
    else:
        logger.error(f"Пользователь с электронной почтой {email} не найден.")

    return user


async def authenticate_user(db: AsyncSession, email: str, password: str):
    """
    Аутентификация пользователя по электронной почте и паролю.

    - email: Электронная почта пользователя.
    - password: Пароль пользователя.

    Возвращает пользователя, если аутентификация успешна, иначе - False.
    """
    logger.info(f"Попытка аутентификации пользователя с электронной почтой: {email}")
    user = await get_user_by_email(db, email)

    if not user:
        logger.error(f"Пользователь с электронной почтой {email} не найден.")
        return False

    if not verify_password(password, user.password_hash):
        logger.error(f"Не удалось проверить пароль для пользователя {email}.")
        return False

    logger.info(f"Пользователь {email} аутентифицирован.")
    return user


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Извлечение текущего аутентифицированного пользователя из запроса.

    Проверяет наличие токена доступа в куках и декодирует его.
    """
    logger.info(f"Куки в запросе: {request.cookies}")
    token = request.cookies.get("access_token")

    if not token:
        logger.error("Token not found in cookies.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Не аутентифицирован",
        )

    try:
        logger.info("Попытка декодирования JWT...")
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        email: str = payload.get("sub")

        if email is None:
            logger.error("Payload JWT не содержит адрес электронной почты.")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Не аутентифицирован")

        token_data = schemas.TokenData(email=email)
    except JWTError as e:
        logger.error(f"Ошибка проверки JWT: {str(e)}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Не аутентифицирован")

    user = await get_user_by_email(db, email=token_data.email)
    if not user:
        logger.error("Пользователь не найден после декодирования токена.")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Не аутентифицирован")

    logger.info(f"Пользователь {user.email} аутентифицирован успешно.")
    return user


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Проверка пароля.

    - plain_password: Обычный (незашифрованный) пароль.
    - hashed_password: Зашифрованный пароль.

    Возвращает True, если пароль верен, иначе - False.
    """
    logger.info("Проверка пароля...")
    is_valid = bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

    if is_valid:
        logger.info("Пароль корректен.")
    else:
        logger.error("Пароль некорректен.")

    return is_valid
