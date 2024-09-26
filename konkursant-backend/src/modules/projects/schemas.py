from pydantic import BaseModel, HttpUrl
from typing import Optional, Any, Dict, List
from datetime import datetime


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    json_data: dict  # Поле для хранения JSON данных


class Project(BaseModel):
    id_project: int
    title: str
    description: Optional[str] = None
    owner_id: int
    owner_full_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    status: str
    docs_file_path: Optional[str] = None

    class Config:
        from_attributes = True
