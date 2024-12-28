from datetime import timedelta
from enum import Enum
from typing import Mapping, Any, List, Optional, Annotated

from pydantic import BaseModel, ConfigDict, WrapSerializer
from pydantic_core.core_schema import SerializerFunctionWrapHandler

from schemas.datasource_column import DatasourceColumnRead


class DatasourceBase(BaseModel):
    name: str
    description: str
    dict_type: int


class DatasourceRead(DatasourceBase):
    pass


class OrderByValues(str, Enum):
    ASC = "ASC"
    DESC = "DESC"


class DatasourceDataReadInput(BaseModel):
    # Column name -> Filter column value
    filters: Mapping[str, str | int] | None = None
    # Column name -> 'ASC' or 'DESC'
    order_by: Mapping[str, OrderByValues] | None = None


def serialize_extra_fields(v: Any, handler: SerializerFunctionWrapHandler) -> Any:
    if isinstance(v, timedelta):
        # Return timedelta value in human-readable form (instead of something like "P1D")
        return str(v).replace(", 0:00:00", "")
    return handler(v)


AnyExtraField = Annotated[Any, WrapSerializer(serialize_extra_fields)]


# load_interval
class DataRow(BaseModel):
    # For extra fields (in our case all fields are extra for model DataRow) use type with serialization function
    # to format timedelta fields into human-readable form
    __pydantic_extra__: dict[str, AnyExtraField]

    model_config = ConfigDict(
        # Allow extra fields
        extra='allow',
    )


class DatasourceDataWithColumnsRead(BaseModel):
    data: List[DataRow]
    columns: Optional[List[DatasourceColumnRead]] = None


class DatasourceDataWrite(BaseModel):
    table_name: str
    primary_key_column: str
    # Primary column value => mapping with changed columns
    edited_rows: Optional[Mapping[str | int, Mapping[str, Any]]]
    # List with mappings of new rows
    new_rows: Optional[List[Mapping[str, Any]]]


class DatasourceDataDelete(BaseModel):
    table_name: str
    deleted_rows: List[Mapping[str, Any]]
