from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.modules.auth.auth import get_current_user
from src.modules.auth.models import User
from src.projects.models import Project
from src.database import async_session

async def get_db():
    async with async_session() as session:
        yield session

async def get_project(project_id: int, db: AsyncSession = Depends(get_db)):
    query = select(Project).where(Project.id_project == project_id)
    result = await db.execute(query)
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

def get_reviewer(current_user: User = Depends(get_current_user)):
    if current_user.role != 'reviewer':
        raise HTTPException(status_code=403, detail="Not authorized to review projects")
    return current_user
