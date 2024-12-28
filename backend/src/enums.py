from enum import Enum


class ColumnDataType(Enum):
    Integer = 'integer'
    Bigint = 'bigint'
    Text = 'text'
    Array = 'ARRAY'
    TimeWithoutTimeZone = 'time without time zone'
    TimestampWithoutTimeZone = 'timestamp without time zone'
    Interval = 'interval'
    Jsonb = 'jsonb'
    Cron = 'cron'
