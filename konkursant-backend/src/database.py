from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import MetaData
from databases import Database
from .config import settings

DATABASE_URL = settings.database_url

database = Database(DATABASE_URL)

# Изменение подключения к созданию асинхронного двигателя
async_engine = create_async_engine(DATABASE_URL, future=True, echo=True, connect_args={"check_same_thread": False})

async_session = sessionmaker(bind=async_engine, expire_on_commit=False, class_=AsyncSession)

metadata = MetaData()

Base = declarative_base(metadata=metadata)
