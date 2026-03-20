from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class PerformerBase(BaseModel):
    name: str

class PerformerCreate(PerformerBase):
    pass

class Performer(PerformerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)