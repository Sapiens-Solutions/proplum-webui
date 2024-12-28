from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import DBAPIError

from crud import load_info as load_info_crud
from db_helper import db_helper
from schemas.load_info import GenerateLoadInfoInput, GenerateLoadInfoResponse
from utils import parse_database_error

router = APIRouter(tags=["LoadInfo"])


@router.post("/generate", response_model=GenerateLoadInfoResponse)
async def generate_load_info(
        params: GenerateLoadInfoInput,
        session: AsyncSession = Depends(db_helper.session_getter),
):
    try:
        load_info_id = await load_info_crud.generate_load_info(params=params, session=session)
        return {
            'load_info_id': load_info_id,
        }
    except DBAPIError as e:
        error_message = parse_database_error(e)
        raise HTTPException(
            status_code=400,
            detail=error_message,
        )
