from typing import List

from pydantic import BaseModel

from models.datasource_column import DatasourceColumnValue


class DatasourceColumnBase(BaseModel):
    column_name: str
    data_type: str
    comment: str | None = None


class DatasourceColumnRead(DatasourceColumnBase):
    pass


class DatasourceColumnValuesRead:
    values: List[DatasourceColumnValue]
