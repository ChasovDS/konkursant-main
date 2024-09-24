from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from src.database import Base
from sqlalchemy.sql import func


class Project(Base):
    __tablename__ = 'projects'

    id_project = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    owner_id = Column(Integer, ForeignKey('users.id_user'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    status = Column(String, default='Ожидает проверки', nullable=False)

    docs_file_path = Column(String, nullable=True)
    json_file_path = Column(String, nullable=True)

    owner = relationship("User", back_populates="projects")
    reviews = relationship("Review", back_populates="project")

    data = relationship("ProjectData", back_populates="project", uselist=False)


class ProjectData(Base):
    __tablename__ = 'project_data'

    id_data = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id_project'), nullable=False)
    json_data = Column(JSON, nullable=False)

    project = relationship("Project", back_populates="data")
