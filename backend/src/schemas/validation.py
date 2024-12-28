from typing import Any

from pydantic import BaseModel

from enums import ColumnDataType


class ValidateValueInput(BaseModel):
    value: Any
    type: ColumnDataType


class ValidateValueResponse(BaseModel):
    error: str | None
