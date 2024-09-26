from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response, status, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from typing import List, Optional

from src.modules.auth.auth import get_current_user
from src.modules.auth.models import User

from src.modules.projects.models import Project, ProjectData
from src.modules.projects import schemas
from src.modules.projects.projects import convert_docx_to_json
from src.modules.review.models import Review


from src.database import async_session
from sqlalchemy import or_
from datetime import datetime
import json
import os
import shutil
import logging


# Создание экземпляра маршрутизатора
project_router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Асинхронная функция для получения соединения с базой данных
async def get_db():
    async with async_session() as session:
        yield session


# Асинхронная функция для обработки загруженного файла и обновления базы данных
async def read_json_file(filepath: str):
    """Функция для чтения данных из JSON файла."""
    try:
        with open(filepath, 'r', encoding='utf-8') as json_file:
            return json.load(json_file)
    except Exception as e:
        logger.error(f"Ошибка чтения JSON файла: {e}")
        raise HTTPException(status_code=500, detail="Ошибка чтения JSON файла.")


async def update_project_data(db: AsyncSession, project_id: int, json_data: dict):
    """Функция для обновления или создания данных проекта в базе данных."""
    async with db.begin():
        # Получаем проект по ID
        project = (await db.execute(
            select(Project).filter(Project.id_project == project_id)
        )).scalar_one_or_none()

        if project is None:
            logger.warning(f"Проект с ID {project_id} не найден.")
            return

        # Получаем или создаем проектные данные
        project_data = (await db.execute(
            select(ProjectData).filter(ProjectData.project_id == project_id)
        )).scalar_one_or_none()

        if project_data is None:
            project_data = ProjectData(project_id=project_id, json_data=json_data)
            db.add(project_data)
            logger.info("Новые данные проекта добавлены.")
        else:
            project_data.json_data = json_data
            logger.info("Данные проекта обновлены.")

        await db.commit()
        logger.info("Изменения успешно сохранены.")

async def process_file_and_update_db(file_path: str, project_id: int, db: AsyncSession):
    # Конвертируем DOCX файл в JSON формат
    json_filepath = convert_docx_to_json(file_path)

    # Читаем данные из JSON файла
    json_data = await read_json_file(json_filepath)
    if json_data is None:
        return

    # Обновляем данные проекта в базе данных
    await update_project_data(db, project_id, json_data)

async def process_file_and_update_db_local(json_filepath: str, project_id: int, db: AsyncSession):
    # Читаем данные из JSON файла
    json_data = await read_json_file(json_filepath)
    if json_data is None:
        return

    # Обновляем данные проекта в базе данных
    await update_project_data(db, project_id, json_data)


# Получение списка проектов
@project_router.get("/all_access_projects/", response_model=List[schemas.Project], tags=["Проекты"])
async def get_list_available_project_info(current_user: User = Depends(get_current_user),
                                          db: AsyncSession = Depends(get_db)):
    """
    Возвращает список доступных проектов для текущего пользователя.
    Проверяет роль пользователя для определения видимости проектов.

    - **current_user**: Текущий аутентифицированный пользователь.
    - **db**: Сессия базы данных.
    """
    if current_user.role in ['admin', 'reviewer']:
        query = select(Project).options(joinedload(Project.owner))  # Администраторы и рецензенты видят все проекты
    else:
        query = select(Project).where(Project.owner_id == current_user.id_user).options(
            joinedload(Project.owner))  # Обычные пользователи видят только свои проекты

    result = await db.execute(query)
    projects = result.scalars().all()

    # Формируем список проектов для возврата с добавлением полного имени владельца
    projects_with_full_name = [
        schemas.Project(
            id_project=project.id_project,
            title=project.title,
            description=project.description,
            owner_id=project.owner_id,
            owner_full_name=project.owner.full_name,
            created_at=project.created_at,
            updated_at=project.updated_at,
            status=project.status,
            docs_file_path=project.docs_file_path
        ) for project in projects
    ]

    return projects_with_full_name


# Создание нового проекта
@project_router.post("/create/", response_model=schemas.Project, tags=["Проекты"])
async def create_project(
        background_tasks: BackgroundTasks,
        title: str = Form(...),  # Обязательное поле для названия
        description: Optional[str] = Form(None),  # Описание проекта (необязательное)
        docs_file: UploadFile = File(...),  # Загружаемый файл (обязательное поле)
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Создает новый проект и сохраняет загруженный файл.
    Проверяет наличие обязательных данных для создания проекта.

    - **title**: Название проекта.
    - **description**: Описание проекта (необязательное).
    - **docs_file**: Загружаемый файл для проекта.
    - **current_user**: Текущий аутентифицированный пользователь.
    - **db**: Сессия базы данных.
    """
    if not title or not docs_file:
        raise HTTPException(status_code=422, detail="Необходимые поля: title и docs_file.")

    logger.info(f"Создание проекта: Title: {title}, Description: {description}, Filename: {docs_file.filename}")

    # Определяем путь для сохранения файла
    script_path = os.path.abspath(__file__)
    three_levels_up = os.path.dirname(os.path.dirname(os.path.dirname(script_path)))
    file_location = f"{three_levels_up}/_resources/upload_files/projects_docx/{docs_file.filename}"
    file_name = os.path.splitext(os.path.basename(file_location))[0]

    json_file_location = os.path.join(
        f"{three_levels_up}/_resources/upload_files/projects_json",
        f"{file_name}.json"
    )

    # Нормализуем путь
    json_file_location = os.path.normpath(json_file_location)

    # Сохранение загруженного файла на сервере
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(docs_file.file, buffer)

    # Создание объекта нового проекта
    new_project = Project(
        title=title,
        description=description,
        docs_file_path=file_location,
        json_file_path=json_file_location,
        owner_id=current_user.id_user,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        status='Ожидает проверки'  # Пример статуса проекта
    )

    db.add(new_project)
    await db.commit()
    await db.refresh(new_project)

    # Добавление фоновой задачи для обработки файла и обновления данных проекта
    background_tasks.add_task(process_file_and_update_db, file_location, new_project.id_project, db)

    return new_project


# Получение данных JSON проекта
@project_router.get("/{project_id}/json-data", response_model=dict, tags=["Проекты"])
async def get_json_data(project_id: int, current_user: User = Depends(get_current_user),
                        db: AsyncSession = Depends(get_db)):
    """
    Получает данные JSON для указанного проекта по его ID.
    Проверяет права доступа к проекту.

    - **project_id**: Идентификатор проекта.
    - **current_user**: Текущий аутентифицированный пользователь.
    - **db**: Сессия базы данных.
    """
    query = select(Project).where(
        Project.id_project == project_id,
        or_(
            Project.owner_id == current_user.id_user,
            current_user.role in ["admin", "reviewer"]
        )
    )
    result = await db.execute(query)

    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Проект не найден.")

    json_data_query = select(ProjectData).where(ProjectData.project_id == project_id)
    json_data_result = await db.execute(json_data_query)
    project_data = json_data_result.scalar_one_or_none()

    if not project_data:
        raise HTTPException(status_code=404, detail="Данные JSON проекта не найдены.")

    return project_data.json_data


# Удаление проекта
@project_router.delete("/delete/{project_id}/", tags=["Проекты"])
async def delete_project(
        project_id: int,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Удаляет указанный проект по его ID.
    Проверяет права доступа пользователя и наличие проекта.

    - **project_id**: Идентификатор проекта, который нужно удалить.
    - **current_user**: Текущий аутентифицированный пользователь.
    - **db**: Сессия базы данных.
    """
    # Получение проекта по ID
    result = await db.execute(select(Project).filter(Project.id_project == project_id))
    project = result.scalars().first()

    if not project:
        raise HTTPException(status_code=404, detail="Проект не найден.")

    # Проверка прав доступа
    if current_user.role not in ["admin", "reviewer"] and project.owner_id != current_user.id_user:
        raise HTTPException(status_code=403, detail="У вас нет прав удалять этот проект.")

    try:
        # Удаление связанных данных из ProjectData
        project_data_results = await db.execute(
            select(ProjectData).filter(ProjectData.project_id == project_id)
        )
        project_data_list = project_data_results.scalars().all()

        for project_data in project_data_list:
            await db.delete(project_data)
            logger.info(f"Данные проекта с ID {project_data.id_data} успешно удалены.")

        # Удаление связанных данных из Reviews
        review_results = await db.execute(
            select(Review).filter(Review.project_id == project_id)
        )
        review_list = review_results.scalars().all()

        for review in review_list:
            await db.delete(review)
            logger.info(f"Отзыв с ID {review.id_review} успешно удален.")

        # Удаление основного проекта
        await db.delete(project)
        await db.commit()

        return {"detail": "Проект и связанные данные успешно удалены."}

    except Exception as e:
        logger.error(f"Ошибка при удалении проекта и связанных данных: {e}")
        await db.rollback()  # Возврат к состоянию до изменений
        raise HTTPException(status_code=500, detail="Ошибка сервера при удалении проекта.")


# Получение проекта по ID
@project_router.get("/{project_id}", response_model=schemas.Project, tags=["Проекты"])
async def get_project(
        project_id: int,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Получает проект по его ID.
    Проверяет права доступа пользователя к проекту.

    - **project_id**: Идентификатор проекта, который нужно получить.
    - **current_user**: Текущий аутентифицированный пользователь.
    - **db**: Сессия базы данных.
    """
    query = select(Project).where(Project.id_project == project_id)
    result = await db.execute(query)
    project = result.scalars().first()

    if not project:
        raise HTTPException(status_code=404, detail="Проект не найден.")

    if project.owner_id != current_user.id_user and current_user.role not in ['admin', 'reviewer']:
        raise HTTPException(status_code=403, detail="У вас нет доступа к этому проекту.")

    return project


@project_router.post("/{project_id}/add-file-link/", tags=["Дополнительные файлы"])
async def add_file_link(
        background_tasks: BackgroundTasks,
        project_id: int,
        file_ids: List[str],
        file_links: List[str],
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Добавляет ссылки на дополнительные файлы к проекту.

    - **project_id**: ID проекта, к которому добавляются ссылки.
    - **file_ids**: Список ID дополнительных файлов.
    - **file_links**: Список ссылок на файлы.
    - **current_user**: Текущий аутентифицированный пользователь.
    - **db**: Сессия базы данных.
    """
    # Проверка прав доступа
    project_result = await db.execute(select(Project).filter(Project.id_project == project_id))
    project = project_result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Проект не найден.")

    # Проверка на совпадение длины списков
    if len(file_ids) != len(file_links):
        raise HTTPException(status_code=400, detail="Количество ID файлов не соответствует количеству ссылок.")

    # Загрузка JSON данных
    json_file_path = project.json_file_path  # Предполагаем, что JSON файл хранится по пути проекта
    try:
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            json_data = json.load(json_file)
    except Exception as e:
        logger.error(f"Ошибка чтения JSON файла: {e}")
        raise HTTPException(status_code=500, detail="Не удалось прочитать файл данных проекта.")

    # Добавление ссылок в структуру JSON
    additional_files = json_data.get("Вкладка Доп. Файлы", {}).get("Файлы", [])

    # Обновление ссылок в структуре JSON
    for file_id, file_link in zip(file_ids, file_links):
        # Проверяем, что файл с данным ID интересует нас
        for file in additional_files:
            if file["ID файла"] == file_id:
                # Обновление ссылки на файл
                file["Ссылка на файл:"] = file_link  # Здесь обновляем поле
                break
        else:
            logger.warning(f"Дополнительный файл с ID {file_id} не найден.")
            raise HTTPException(status_code=404, detail=f"Дополнительный файл с ID {file_id} не найден.")

    # Запись обратно в JSON файл
    try:
        with open(json_file_path, 'w', encoding='utf-8') as json_file:
            json.dump(json_data, json_file, ensure_ascii=False, indent=4)
    except Exception as e:
        logger.error(f"Ошибка записи в JSON файл: {e}")
        raise HTTPException(status_code=500, detail="Не удалось обновить файл данных проекта.")
    # Обновление данных проекта в базе данных
    background_tasks.add_task(process_file_and_update_db_local, json_file_path, project_id, db)

    logger.info(f"Ссылки на файлы добавлены к проекту с ID {project_id}.")
    return {"detail": "Ссылки на файлы успешно добавлены."}