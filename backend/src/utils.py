import json

from typing import Mapping, List, Any

from sqlalchemy import bindparam, BindParameter
from sqlalchemy.types import String
from sqlalchemy.exc import DBAPIError

from config import settings
from consts import CLIENT_ALLOWED_DATABASE_NAMES, TABLE_COLUMN_VALIDATION_TYPE
from enums import ColumnDataType
from schemas.datasource_column import DatasourceColumnBase
from fastapi import HTTPException
from croniter import croniter


def get_where_statement_by_filters(
        filters: Mapping[str, str | int] | None,
        columns_dict: Mapping[str, str],
        bind_params: list[BindParameter[str]] | None,
) -> str:
    if filters is None:
        return ""

    where_conditions: list[str] = []
    for field, value in filters.items():
        if field not in columns_dict:
            continue

        param_name = f"{field}_value"
        where_conditions.append(f"CAST({field} as TEXT) ILIKE CONCAT('%', :{param_name}, '%')")
        bind_params.append(bindparam(param_name, value=str(value), type_=String))

    where_text: str
    if len(where_conditions) > 0:
        where_text = f"WHERE {' AND '.join(where_conditions)}"
    else:
        where_text = ""

    return where_text


def get_order_by_statement_by_mapping(
        order_by: Mapping[str, str] | None,
        columns_dict: Mapping[str, str],
) -> str:
    if order_by is None:
        return ""

    fields_order_by: list[str] = []
    for field, value in order_by.items():
        if field not in columns_dict:
            continue

        fields_order_by.append(f"{field} DESC" if value.lower() == "desc" else f"{field} ASC")

    order_by_text: str
    if len(fields_order_by) > 0:
        order_by_text = f"ORDER BY {', '.join(fields_order_by)}"
    else:
        order_by_text = ""

    return order_by_text


# Gets list of columns and returns dict: column_name -> column_data_type
def get_columns_dict(
        columns: List[DatasourceColumnBase]
) -> Mapping[str, str]:
    columns_dict = {}
    for i in range(0, len(columns)):
        col = columns[i]
        columns_dict[col.column_name] = col.data_type

    return columns_dict


def format_column_validation_value(
        column_value: str | int | List | Mapping,
        data_type: str,
) -> Any:
    if column_value is None or (
            column_value == "" and data_type != ColumnDataType.Text.value):
        return None
    if data_type == "ARRAY":
        # ['value1','value2'] -> '{value1,value2}'
        return "{" + f"{",".join(column_value)}" + "}"
    if data_type == "jsonb":
        # {'field1': 'value1', 'field2': 'value2'} -> '{'field1': 'value1', 'field2': 'value2'}'
        return f"{json.dumps(column_value)}"

    return str(column_value)


def format_column_validation_type(
        data_type: str,
) -> Any:
    if data_type == "ARRAY":
        return "varchar[]"

    return data_type


def validate_cron_value(
        value: str | None,
) -> str | None:
    if value == "None":
        return None

    if value is None:
        return "invalid value of type cron: NULL"

    is_valid = croniter.is_valid(value)
    if is_valid:
        return None

    error_message: str
    if value is None or value == "" or value == "NULL":
        error_message = "invalid value of type cron"
    else:
        error_message = f"invalid value of type cron: {value}"

    return error_message


# Function that should be used for validating values of specified types received from client. Returns tuple:
# - error message or None;
# - bool which indicates if value has type that should (and have been) be validated.
def get_value_validation_info(
        value: Any,
        data_type: str,
) -> (str | None, bool):
    # Validate cron value
    if data_type == ColumnDataType.Cron.value:
        return validate_cron_value(value), True

    return None, False


# Function that uses possibly overridden type for validation of value from specific table and column
def get_table_column_value_validation_info(
        value: Any,
        initial_data_type: str,
        table_name: str,
        column_name: str,
) -> (str | None, bool):
    data_type = initial_data_type

    # Check if column has overridden validation type
    if table_name in TABLE_COLUMN_VALIDATION_TYPE:
        table_column_types = TABLE_COLUMN_VALIDATION_TYPE[table_name]
        if column_name in table_column_types:
            data_type = table_column_types[column_name]

    return get_value_validation_info(value, data_type)


# Validates column value and throws error if value is not valid
def validate_table_column_value(
        value: Any,
        initial_data_type: str,
        table_name: str,
        column_name: str,
):
    validation_error, _ = get_table_column_value_validation_info(
        value=value,
        initial_data_type=initial_data_type,
        table_name=table_name,
        column_name=column_name
    )

    if validation_error is not None:
        raise HTTPException(
            status_code=400,
            detail=validation_error,
        )


def parse_database_error(
        error: DBAPIError,
) -> str:
    string_error_origin = str(error.orig)
    splitted_error_messages = string_error_origin.split("'>: ", 1)

    if len(splitted_error_messages) > 1:
        return splitted_error_messages[1]
    else:
        return string_error_origin


def check_table_availability(
        table_name: str,
):
    is_datasource_allowed = table_name in CLIENT_ALLOWED_DATABASE_NAMES

    if not is_datasource_allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Table \'{table_name}\' doesn't exist in \'{settings.db.database_schema}\' schema",
        )


# Gets value and its type, returns sql statement for value and bind param
def get_column_value_sql_statement_and_bind_param(
        column_value: str | int | List | Mapping,
        data_type: str,
        param_name: str,
) -> tuple[str, BindParameter[str]]:
    formatted_value = format_column_validation_value(column_value, data_type)
    formatted_value_type = format_column_validation_type(data_type)

    sql_value = f"cast(:{param_name} as {formatted_value_type})"
    bind_param = bindparam(param_name, value=formatted_value, type_=String)

    return sql_value, bind_param


# Gets value, its type and bind params array, adds new bind_param to array and returns sql statement for value
def get_column_value_sql_statement_and_add_bind_param(
        column_value: str | int | List | Mapping,
        data_type: str,
        param_name: str,
        bind_params: list,
) -> str:
    sql_value, bind_param = get_column_value_sql_statement_and_bind_param(column_value, data_type, param_name)
    bind_params.append(bind_param)

    return sql_value
