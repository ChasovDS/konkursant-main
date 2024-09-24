from sqlalchemy import Column, Integer, ForeignKey, Float, Text, DateTime, func, SmallInteger
from sqlalchemy.orm import relationship


from src.database import Base

class Review(Base):
    __tablename__ = 'reviews'

    id_review = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id_project'), nullable=False)
    reviewer_id = Column(Integer, ForeignKey('users.id_user'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Оценка по критериям
    team_experience = Column(SmallInteger, nullable=False)  # Опыт и компетенции команды проекта
    project_relevance = Column(SmallInteger, nullable=False)  # Актуальность и социальная значимость проекта
    solution_uniqueness = Column(SmallInteger, nullable=False)  # Уникальность и адресность предложенного решения проблемы
    implementation_scale = Column(SmallInteger, nullable=False)  # Масштаб реализации проекта
    development_potential = Column(SmallInteger, nullable=False)  # Перспектива развития и потенциал проекта
    project_transparency = Column(SmallInteger, nullable=False)  # Информационная открытость проекта
    feasibility_and_effectiveness = Column(SmallInteger, nullable=False)  # Реализуемость проекта и его результативность
    additional_resources = Column(SmallInteger, nullable=False)  # Собственный вклад и дополнительные ресурсы проекта
    planned_expenses = Column(SmallInteger, nullable=False)  # Планируемые расходы на реализацию проекта
    budget_realism = Column(SmallInteger, nullable=False)  # Реалистичность бюджета проекта

    #Фитбек по проекту
    feedback = Column(Text, default='Комментариев нет', nullable=False)

    project = relationship("Project", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews")
