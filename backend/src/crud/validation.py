from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text
from sqlalchemy.exc import DBAPIError

from enums import ColumnDataType
from utils import parse_database_error, get_column_value_sql_statement_and_bind_param, \
    get_value_validation_info


async def validate_value(
        session: AsyncSession,
        value: Any,
        value_type: ColumnDataType,
) -> str | None:
    error_message, was_validated = get_value_validation_info(value, value_type.value)
    if was_validated:
        return error_message

    # Validate value of other type
    error_message = None
    try:
        sql_value_statement, bind_param = get_column_value_sql_statement_and_bind_param(
            value,
            value_type.value,
            'value',
        )

        statement = text(
            f"select {sql_value_statement} as validation_test;"
        ).bindparams(bind_param)

        await session.execute(statement)
    except DBAPIError as e:
        error_message = parse_database_error(e)

    return error_message
