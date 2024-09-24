from pydantic import BaseModel
from typing import Optional

class ReviewBase(BaseModel):
    project_id: int
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
    feedback: Optional[str]
    status: str

    class Config:
        from_attributes = True