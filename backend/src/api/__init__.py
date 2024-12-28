from fastapi import APIRouter

from .datasource import router as datasources_router
from .datasource_column import router as datasource_columns_router
from .load_info import router as load_info_router
from .validation import router as validation_router

router = APIRouter()

router.include_router(datasources_router, prefix="/datasource")
router.include_router(datasource_columns_router, prefix="/datasource_columns")
router.include_router(load_info_router, prefix="/load_info")
router.include_router(validation_router, prefix="/validation")
