from typing import Optional

from pydantic import BaseModel, Field


class GenerateLoadInfoInput(BaseModel):
    object_id: int
    start_extr: Optional[str] = Field(None)
    end_extr: Optional[str] = Field(None)
    extraction_type: Optional[str] = Field(None)
    load_type: Optional[str] = Field(None)
    delta_mode: Optional[str] = Field(None)
    load_interval: Optional[str] = Field(None)
    start_load: Optional[str] = Field(None)
    end_load: Optional[str] = Field(None)


class GenerateLoadInfoResponse(BaseModel):
    load_info_id: int | None
