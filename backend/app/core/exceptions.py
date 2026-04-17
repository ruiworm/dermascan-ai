import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.schemas.response import ErrorResponse

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("dermascan_api")

async def log_requests_middleware(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        logger.info(f"Response status code: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request failed: {request.method} {request.url} - Error: {str(e)}", exc_info=True)
        raise

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Override standard validation error to match our Response format"""
    logger.warning(f"Validation error on {request.method} {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            code=422,
            message="Validation Error",
            details=exc.errors()
        ).model_dump()
    )

async def generic_exception_handler(request: Request, exc: Exception):
    """Catch-all for unhandled exceptions to return standard error format"""
    logger.error(f"Unhandled exception on {request.method} {request.url}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            code=500,
            message="Internal Server Error"
        ).model_dump()
    )
