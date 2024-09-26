from pydantic import BaseModel
from typing import Optional

class ReviewBase(BaseModel):
    reviewer_id: int
    project_id: int
    project_title: str
    team_experience: int
    project_relevance: int
    solution_uniqueness: int
    implementation_scale: int
    development_potential: int
    project_transparency: int
    feasibility_and_effectiveness: int
    additional_resources: int
    planned_expenses: int
    budget_realism: int
    feedback: str
    status: str

    class Config:
        from_attributes = True