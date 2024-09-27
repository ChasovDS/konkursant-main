from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy import func


from src.modules.auth.auth import get_current_user
from src.modules.auth.models import User
from src.modules.projects.models import Project
from src.modules.review.models import Review
from src.modules.review.schemas import ReviewBase

from src.database import async_session

# Создание экземпляра маршрутизатора для обработки отзывов
review_router = APIRouter()

# Асинхронная функция для получения соединения с базой данных
async def get_db():
    async with async_session() as session:
        yield session

# Вспомогательная функция для преобразования отзыва в ReviewBase
def transform_review_to_base(review: Review, project_status: str) -> ReviewBase:
    return ReviewBase(
        project_id=review.project_id,
        reviewer_id=review.reviewer_id,
        project_title=review.project_title,
        author_name=review.author_name,
        team_experience=review.team_experience,
        project_relevance=review.project_relevance,
        solution_uniqueness=review.solution_uniqueness,
        implementation_scale=review.implementation_scale,
        development_potential=review.development_potential,
        project_transparency=review.project_transparency,
        feasibility_and_effectiveness=review.feasibility_and_effectiveness,
        additional_resources=review.additional_resources,
        planned_expenses=review.planned_expenses,
        budget_realism=review.budget_realism,
        feedback=review.feedback,
        status=project_status
    )

# Обрабатываем ошибки доступа
async def check_access_rights(current_user: User, project: Project):
    if current_user.role != 'reviewer' and project.owner_id != current_user.id_user:
        raise HTTPException(status_code=403, detail="У вас нет доступа к этому проекту")

# Проверка существования проекта
async def get_project_by_id(project_id: int, db: AsyncSession) -> Project:
    query = select(Project).where(Project.id_project == project_id).options(joinedload(Project.reviews))
    result = await db.execute(query)
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Проект не найден")
    return project

# Эндпоинт для создания отзыва на проект
@review_router.post("/create_review/{project_id}", response_model=ReviewBase, tags=["Проверка"])
async def create_review_for_project(
        project_id: int,
        review: ReviewBase,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    # Устанавливаем reviewer_id из current_user
    review.reviewer_id = current_user.id_user
    review.project_id = project_id

    # Проверяем роль пользователя
    if current_user.role != 'reviewer':
        raise HTTPException(status_code=403, detail="У Вас нет прав для оценки проекта")

    # Получаем проект
    project = await get_project_by_id(project_id, db)
    if not project:
        raise HTTPException(status_code=404, detail="Проект не найден")

    # Получаем количество существующих отзывов для проекта
    existing_reviews_count = await db.execute(
        select(func.count()).where(Review.project_id == project_id)
    )
    existing_reviews_count = existing_reviews_count.scalar()

    # Проверяем, не превышает ли количество отзывов лимит
    if existing_reviews_count >= 3:
        raise HTTPException(status_code=400, detail="Не удается оставить отзыв: Возможно, вы оставили его ранее, или проект уже собрал 3 отзыва.")

    # Проверяем, оставлял ли рецензент уже отзыв для этого проекта
    existing_review = await db.execute(
        select(Review).where(Review.reviewer_id == current_user.id_user, Review.project_id == project_id)
    )
    existing_review = existing_review.scalars().first()

    if existing_review:
        raise HTTPException(status_code=400, detail="Не удается оставить отзыв: Возможно, вы оставили его ранее, или проект уже собрал 3 отзыва.")

    # Подготовка и создание нового отзыва
    new_review_data = review.dict()
    new_review_data.pop('status', None)  # Удаляем статус, если он есть
    new_review_data.update({
        "reviewer_id": current_user.id_user,
        "project_id": project_id
    })

    # Создаем новый объект отзыва
    new_review = Review(**new_review_data)
    project.reviews.append(new_review)
    project.status = 'Оценено'

    try:
        db.add(new_review)
        await db.commit()
        await db.refresh(new_review)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при создании отзыва: {str(e)}")

    return transform_review_to_base(new_review, project.status)




# Эндпоинт для получения отзывов по проекту
@review_router.get("/{project_id}", response_model=list[ReviewBase], tags=["Проверка"])
async def get_project_reviews(
        project_id: int,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    # Получаем проект
    project = await get_project_by_id(project_id, db)

    # Проверяем доступ
    await check_access_rights(current_user, project)

    # Формируем список отзывов
    return [transform_review_to_base(review, project.status) for review in project.reviews]

# Эндпоинт для получения всех проверенных проектов
@review_router.get("/verified_projects/", response_model=list[ReviewBase], tags=["Проверка"])
async def get_verified_projects(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ['reviewer', 'admin']:
        raise HTTPException(status_code=403, detail="У вас нет доступа к этой информации")

    # Получение всех проектов с отзывами
    query = select(Project).options(joinedload(Project.reviews))
    result = await db.execute(query)
    projects = result.unique().scalars().all()

    # Формирование списка проверенных отзывов
    verified_reviews = [
        transform_review_to_base(review, project.status)
        for project in projects
        for review in project.reviews
    ]

    return verified_reviews
