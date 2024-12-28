from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from crud import validation as validation_crud
from db_helper import db_helper
from schemas.validation import ValidateValueResponse, ValidateValueInput

router = APIRouter(tags=["Validation"])


@router.post("/validate", response_model=ValidateValueResponse)
async def validate(
        params: ValidateValueInput,
        session: AsyncSession = Depends(db_helper.session_getter),
):
    error: str
    try:
        error = await validation_crud.validate_value(value=params.value, value_type=params.type, session=session)
    except:
        error = f'invalid value of type {params.type.value}'

    return {
        'error': error,
    }
