from typing import Any, Optional

from sqlalchemy.orm import declarative_base, Mapped, mapped_column

Base = declarative_base()


class DatasourceColumn(Base):
    __tablename__ = "columns"
    __table_args__ = {"schema": "information_schema"}

    column_name: Mapped[str] = mapped_column(primary_key=True)
    table_name: Mapped[str] = mapped_column()
    table_schema: Mapped[str] = mapped_column()
    data_type: Mapped[str] = mapped_column()
    ordinal_position: Mapped[int] = mapped_column()


class DatasourceColumnValue:
    value: Any
    description: Optional[str]
