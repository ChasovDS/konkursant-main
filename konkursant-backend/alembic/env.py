import os
import sys
import asyncio
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy import pool, MetaData
from alembic import context

# Добавление пути к папке с исходным кодом
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Файлы модулей
from src.modules.auth.models import User
from src.modules.projects.models import Project
from src.modules.review.models import Review

# Файлы основного приложения
from src.database import Base, metadata
from src.config import settings

# Настройка конфигурации Alembic
config = context.config
fileConfig(config.config_file_name)

# Асинхронный URL для подключения к базе данных
async_database_url = settings.database_url

# Определяем метаданные для целевой базы данных
target_metadata = metadata


def run_migrations_offline() -> None:
    """
    Выполняет миграции в оффлайн-режиме.
    """
    # Получаем URL для подключения к базе данных
    url = config.get_main_option("sqlalchemy.url")

    # Конфигурируем контекст миграции
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"}  # Использование именованных параметров
    )

    # Начало транзакции и выполнение миграций
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """
    Выполняет миграции в онлайн-режиме с использованием асинхронного подключения.
    """
    # Создание асинхронного движка подключения к базе данных
    connectable = create_async_engine(async_database_url, poolclass=pool.NullPool,
                                      connect_args={"check_same_thread": False})

    # Установка соединения и выполнение миграций
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)


def do_run_migrations(connection) -> None:
    """
    Конфигурирует миграции и запускает их.

    - connection: Соединение с базой данных.
    """
    # Настройка контекста миграции с переданным соединением
    context.configure(connection=connection, target_metadata=target_metadata, render_as_batch=True)

    # Начало транзакции и выполнение миграций
    with context.begin_transaction():
        context.run_migrations()


# Определение режима работы: оффлайн или онлайн
if context.is_offline_mode():
    run_migrations_offline()  # Запуск оффлайн-миграций
else:
    asyncio.run(run_migrations_online())  # Запуск онлайн-миграций
