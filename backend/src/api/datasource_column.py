from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from crud import datasource_column as datasource_column_crud
from db_helper import db_helper
from schemas.datasource_column import DatasourceColumnRead
from utils import check_table_availability

router = APIRouter(tags=["DatasourceColumn"])


@router.get("", response_model=list[DatasourceColumnRead])
async def get_datasource_columns(
        table_name: str,
        session: AsyncSession = Depends(db_helper.session_getter),
):
    check_table_availability(table_name)

    return await datasource_column_crud.get_datasource_columns(
        table_name=table_name,
        session=session,
        with_comment=True,
    )


@router.get("/values")
async def get_datasource_column_values(
        table_name: str,
        value_column_name: str,
        description_column_name: str | None = None,
        session: AsyncSession = Depends(db_helper.session_getter),
):
    check_table_availability(table_name)

    values = await datasource_column_crud.get_datasource_column_values(
        table_name=table_name,
        value_column_name=value_column_name,
        description_column_name=description_column_name,
        session=session,
    )
    return {"values": values}
