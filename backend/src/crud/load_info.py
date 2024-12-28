from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text

from config import settings
from schemas.load_info import GenerateLoadInfoInput
from utils import get_column_value_sql_statement_and_add_bind_param


async def generate_load_info(
        session: AsyncSession,
        params: GenerateLoadInfoInput,
) -> int | None:
    bind_params = []

    # Create sql statement and bind parameter for each load generation param
    object_id_sql_value_statement = get_column_value_sql_statement_and_add_bind_param(
        params.object_id,
        "int8",
        "object_id",
        bind_params,
    )

    start_extr_sql_value_statement = get_column_value_sql_statement_and_add_bind_param(
        params.start_extr,
        "timestamp without time zone",
        "start_extr",
        bind_params,
    )

    end_extr_sql_value_statement = get_column_value_sql_statement_and_add_bind_param(
        params.end_extr,
        "timestamp without time zone",
        "end_extr",
        bind_params,
    )

    extraction_type_sql_value_statement = get_column_value_sql_statement_and_add_bind_param(
        params.extraction_type,
        "text",
        "extraction_type",
        bind_params,
    )

    load_type_sql_value_statement = get_column_value_sql_statement_and_add_bind_param(
        params.load_type,
        "text",
        "load_type",
        bind_params,
    )

    delta_mode_sql_value_statement = get_column_value_sql_statement_and_add_bind_param(
        params.delta_mode,
        "text",
        "delta_mode",
        bind_params,
    )

    load_interval_sql_value_statement = get_column_value_sql_statement_and_add_bind_param(
        params.load_interval,
        "interval",
        "load_interval",
        bind_params,
    )

    start_load_sql_value_statement = get_column_value_sql_statement_and_add_bind_param(
        params.start_load,
        "timestamp without time zone",
        "start_load",
        bind_params,
    )

    end_load_sql_value_statement = get_column_value_sql_statement_and_add_bind_param(
        params.end_load,
        "timestamp without time zone",
        "end_load",
        bind_params,
    )

    statement = text(
        f"""select {settings.db.database_schema}.f_gen_load_id(
                p_object_id := {object_id_sql_value_statement},
                p_start_extr := {start_extr_sql_value_statement},
                p_end_extr := {end_extr_sql_value_statement},
                p_extraction_type := {extraction_type_sql_value_statement},
                p_load_type := {load_type_sql_value_statement},
                p_delta_mode := {delta_mode_sql_value_statement},
                p_load_interval := {load_interval_sql_value_statement},
                p_start_load := {start_load_sql_value_statement},
                p_end_load := {end_load_sql_value_statement}
        )"""
    ).bindparams(*bind_params)

    result = await session.execute(statement)
    await session.commit()

    # Transform raw arrays of data to dicts with column fields
    data = [
        row._mapping
        for row in result
    ]

    # Return ID of generated load
    return data[0]['f_gen_load_id']
