from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text

from config import settings
from models.datasource_column import DatasourceColumn, DatasourceColumnValue
from utils import get_columns_dict


async def get_datasource_columns(
        session: AsyncSession,
        table_name: str,
        with_comment=False,
) -> List[DatasourceColumn]:
    statement = text(
        f"""select column_name, data_type{", col_description((table_schema||'.'||table_name)::regclass::oid, ordinal_position) as comment" if with_comment else ""}
        from information_schema.columns 
        where table_schema||'.'||table_name = '{settings.db.database_schema}.{table_name}' 
        order by ordinal_position;"""
    )

    result = await session.execute(statement)

    # Transform raw arrays of data to dicts with column fields
    data = [
        row._mapping
        for row in result
    ]
    return data


async def get_datasource_column_values(
        session: AsyncSession,
        table_name: str,
        value_column_name: str,
        description_column_name: Optional[str],
) -> List[DatasourceColumnValue]:
    table_columns = await get_datasource_columns(session=session, table_name=table_name)
    columns_dict = get_columns_dict(table_columns)

    if value_column_name not in columns_dict:
        raise HTTPException(
            status_code=400,
            detail=f"Column \'{value_column_name}\' doesn't exist in \'{table_name}\' table",
        )

    need_description_column = description_column_name is not None
    if need_description_column and description_column_name not in columns_dict:
        raise HTTPException(
            status_code=400,
            detail=f"Column \'{description_column_name}\' doesn't exist in \'{table_name}\' table",
        )

    # SELECT value_column_name AS value, description_column_name AS description from table
    columns_string = (
            f"{value_column_name} AS value" +
            (f", {description_column_name} AS description" if need_description_column else "")
    )

    statement = text(
        f"""SELECT {columns_string} FROM \"{settings.db.database_schema}\".\"{table_name}\"
        order by {value_column_name};"""
    )

    result = await session.execute(statement)

    # Transform raw arrays of data to dicts with column fields
    data = [
        row._mapping
        for row in result
    ]
    return data
