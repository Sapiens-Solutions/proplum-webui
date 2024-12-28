from enums import ColumnDataType

# Shows from which tables clients can get data
CLIENT_ALLOWED_DATABASE_NAMES: dict[str, bool] = {
    "d_extraction_type": True,
    "d_load_type": True,
    "d_load_method": True,
    "d_load_group": True,
    "d_delta_mode": True,
    "objects": True,
    "dependencies": True,
    "load_constants": True,
    "load_info": True,
    "load_status_today": True,
    "objects_log": True,
    "logs": True,
    "chains": True,
    "chains_info": True,
    "chains_log": True,
    "ext_tables_params": True,
}

# Defines validation types for columns from specific tables.
# This allows to add custom validation for some columns.
TABLE_COLUMN_VALIDATION_TYPE: dict[str, dict[str, str]] = {
    "chains": {
        "schedule": ColumnDataType.Cron.value,
    },
}
