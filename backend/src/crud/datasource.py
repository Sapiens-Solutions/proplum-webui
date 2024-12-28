from typing import List, Any, Mapping, Optional

from fastapi import HTTPException
from sqlalchemy import BindParameter, bindparam
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text

from config import settings
from crud import datasource_column as datasource_column_crud
from models.datasource_column import DatasourceColumn
from utils import get_where_statement_by_filters, get_order_by_statement_by_mapping, get_columns_dict, \
    get_column_value_sql_statement_and_add_bind_param, validate_table_column_value


async def get_datasource_data(
        session: AsyncSession,
        table_name: str,
        skip: int,
        limit: int,
        filters: Mapping[str, str | int] | None = None,
        order_by: Mapping[str, str] | None = None,
        table_columns: List[DatasourceColumn] | None = None,
) -> List[Mapping[str, Any]]:
    have_filters_or_order_by = filters is not None or order_by is not None
    if have_filters_or_order_by and table_columns is None:
        table_columns = await datasource_column_crud.get_datasource_columns(session=session, table_name=table_name)

    columns_dict: Mapping[str, str] | None
    if have_filters_or_order_by:
        columns_dict = get_columns_dict(table_columns)

    bind_params: list[BindParameter] = []

    # Make query WHERE statement
    where_text = "" if filters is None else get_where_statement_by_filters(
        filters,
        columns_dict,
        bind_params,
    )

    # Make query ORDER BY statement
    order_by_text = "" if order_by is None else get_order_by_statement_by_mapping(
        order_by,
        columns_dict,
    )

    # Make query LIMIT statement
    limit_text: str
    if limit > 0:
        limit_text = "LIMIT :query_limit_amount"
        bind_params.append(bindparam('query_limit_amount', value=limit))
    else:
        limit_text = ""

    # Make query OFFSET statement
    offset_text: str
    if skip > 0:
        offset_text = "OFFSET :query_skip_amount"
        bind_params.append(bindparam('query_skip_amount', value=skip))
    else:
        offset_text = ""

    table_name_with_schema = f"{settings.db.database_schema}.{table_name}"
    statement = text(
        f"SELECT * FROM {table_name_with_schema} {where_text} {order_by_text} {limit_text} {offset_text}"
    ).bindparams(*bind_params)

    result = await session.execute(statement)

    # Transform raw arrays of data to dicts with column fields
    data = [
        row._mapping
        for row in result
    ]
    return data


async def write_data(
        session: AsyncSession,
        table_name: str,
        primary_key_column: str,
        edited_rows: Optional[Mapping[str, Mapping[str, Any]]],
        new_rows: Optional[List[Mapping[str, Any]]],
):
    table_columns = await datasource_column_crud.get_datasource_columns(session=session, table_name=table_name)
    columns_dict = get_columns_dict(table_columns)

    # If primary key column is not in columns dictionary, end function
    if primary_key_column not in columns_dict:
        raise HTTPException(
            status_code=400,
            detail=f"Column \'{primary_key_column}\' doesn't exist in \'{table_name}\' table",
        )

    primary_key_column_type = columns_dict[primary_key_column]

    # Process edited rows
    if edited_rows is not None:
        for primary_key_value, edited_row in edited_rows.items():
            # Make where statement for row updates
            bind_params: list[BindParameter] = []

            validate_table_column_value(
                value=primary_key_value,
                initial_data_type=primary_key_column_type,
                table_name=table_name,
                column_name=primary_key_column
            )

            primary_key_sql_value_statement = get_column_value_sql_statement_and_add_bind_param(
                primary_key_value,
                primary_key_column_type,
                primary_key_column,
                bind_params,
            )

            edit_where_statement: str = (f"WHERE {settings.db.database_schema}.{table_name}.{primary_key_column} = "
                                         + primary_key_sql_value_statement)

            # Make list of updates for each edited column
            column_updates: List[str] = []
            for column_name, column_value in edited_row.items():
                if column_name not in columns_dict:
                    continue

                column_type = columns_dict[column_name]

                validate_table_column_value(
                    value=column_value,
                    initial_data_type=column_type,
                    table_name=table_name,
                    column_name=column_name
                )

                param_sql_value_statement = get_column_value_sql_statement_and_add_bind_param(
                    column_value,
                    column_type,
                    column_name,
                    bind_params,
                )
                column_updates.append(f"{column_name}={param_sql_value_statement}")

            # Execute UPDATE statement
            if len(column_updates) > 0:
                statement = text(
                    (
                            f"UPDATE {settings.db.database_schema}.{table_name} SET {", ".join(column_updates)} " +
                            edit_where_statement
                    )
                ).bindparams(*bind_params)
                await session.execute(statement)

    # Add new rows
    if new_rows is not None:
        for row in new_rows:
            columns_list: List[str] = []
            values_list: List[str] = []
            bind_params: list[BindParameter] = []

            # Form lists of columns and values for making insert statement
            for column_name, column_value in row.items():
                if column_name not in columns_dict:
                    continue

                column_type = columns_dict[column_name]

                validate_table_column_value(
                    value=column_value,
                    initial_data_type=column_type,
                    table_name=table_name,
                    column_name=column_name
                )

                columns_list.append(column_name)

                param_sql_value_statement = get_column_value_sql_statement_and_add_bind_param(
                    column_value,
                    column_type,
                    column_name,
                    bind_params,
                )
                values_list.append(param_sql_value_statement)

            if len(columns_list) == 0:
                continue

            # Make and execute insert statement
            statement = text(
                (
                        f"INSERT INTO {settings.db.database_schema}.{table_name} " +
                        f"({', '.join([f"\"{column}\"" for column in columns_list])}) " +
                        f"VALUES ({', '.join(values_list)})"
                )
            ).bindparams(*bind_params)
            await session.execute(statement)

    await session.commit()
    return


async def delete_rows(
        session: AsyncSession,
        table_name: str,
        deleted_rows: List[Mapping[str, Any]],
):
    if deleted_rows is None or len(deleted_rows) == 0:
        return

    table_columns = await datasource_column_crud.get_datasource_columns(session=session, table_name=table_name)
    columns_dict = get_columns_dict(table_columns)

    delete_start_statement: str = f"DELETE FROM {settings.db.database_schema}.{table_name} WHERE"

    # Process deleted rows
    for row in deleted_rows:
        # Make list with column values needed for where part of row deletion sql
        row_where_values: List[str] = []
        bind_params: list[BindParameter] = []
        for column_name, column_value in row.items():
            if column_name not in columns_dict:
                continue

            column_type = columns_dict[column_name]

            param_sql_value_statement = get_column_value_sql_statement_and_add_bind_param(
                column_value,
                column_type,
                column_name,
                bind_params,
            )
            row_where_values.append(f"{column_name}={param_sql_value_statement}")

        if len(row_where_values) == 0:
            continue

        #  Execute DELETE statement for row
        statement = text(f"{delete_start_statement} {" AND ".join(row_where_values)}").bindparams(*bind_params)
        await session.execute(statement)

    await session.commit()
    return
