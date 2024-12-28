from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from config import settings

from api import router as api_router
from db_helper import db_helper


# Runs actions before starting server and after closing server
@asynccontextmanager
async def lifespan(app: FastAPI):
    # On server startup
    print(
        'Server docs are available at http://{host}:{port}/docs'.format(host=settings.run.host, port=settings.run.port)
    )

    yield

    # On server shutdown
    print("Disposing database helper engine")
    await db_helper.dispose()


main_app = FastAPI(
    default_response_class=ORJSONResponse,
    lifespan=lifespan,
)

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:5174",
]
allowed_origin = settings.run.allowed_origin
if allowed_origin is not None:
    origins.append(allowed_origin)

main_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

main_app.include_router(api_router, prefix=settings.api.prefix)

if __name__ == "__main__":
    uvicorn.run(
        "main:main_app",
        host=settings.run.host,
        port=settings.run.port,
        reload=True,
    )
