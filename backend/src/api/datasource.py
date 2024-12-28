from sqlalchemy.exc import DBAPIError
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from crud import datasource as datasource_crud
from crud import datasource_column as datasource_column_crud
from db_helper import db_helper
from schemas.datasource import DatasourceDataReadInput, DatasourceDataWithColumnsRead, \
    DatasourceDataWrite, DatasourceDataDelete
from utils import parse_database_error, check_table_availability

router = APIRouter(tags=["Datasource"])


@router.post("/data", response_model=DatasourceDataWithColumnsRead)
async def get_datasource_data(
        params: DatasourceDataReadInput,
        table_name: str,
        skip: int = 0,
        limit: int = 100,
        session: AsyncSession = Depends(db_helper.session_getter),
):
    check_table_availability(table_name)

    table_columns = await datasource_column_crud.get_datasource_columns(
        table_name=table_name,
        session=session,
        with_comment=True,
    )
    table_data = await datasource_crud.get_datasource_data(
        table_name=table_name,
        skip=skip,
        limit=limit,
        filters=params.filters,
        order_by=params.order_by,
        table_columns=table_columns,
        session=session,
    )

    return {
        'data': table_data,
        'columns': table_columns,
    }


@router.delete("/data")
async def delete_data(
        params: DatasourceDataDelete,
        session: AsyncSession = Depends(db_helper.session_getter),
):
    check_table_availability(params.table_name)

    try:
        return await datasource_crud.delete_rows(
            table_name=params.table_name,
            deleted_rows=params.deleted_rows,
            session=session,
        )
    except DBAPIError as e:
        error_message = parse_database_error(e)
        raise HTTPException(
            status_code=400,
            detail=error_message,
        )


@router.post("/data/write")
async def write_data(
        params: DatasourceDataWrite,
        session: AsyncSession = Depends(db_helper.session_getter),
):
    check_table_availability(params.table_name)

    try:
        return await datasource_crud.write_data(
            table_name=params.table_name,
            primary_key_column=params.primary_key_column,
            edited_rows=params.edited_rows,
            new_rows=params.new_rows,
            session=session,
        )
    except DBAPIError as e:
        error_message = parse_database_error(e)
        raise HTTPException(
            status_code=400,
            detail=error_message,
        )
