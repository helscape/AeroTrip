from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class ApiError(Exception):
    """Domain error rendered with the standard error envelope."""

    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: list | None = None,
    ) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details or []
        super().__init__(message)


def error_response(status_code: int, code: str, message: str, details: list | None = None):
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message, "details": details or []}},
    )


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def handle_api_error(_request: Request, exc: ApiError):
        return error_response(exc.status_code, exc.code, exc.message, exc.details)

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(_request: Request, exc: RequestValidationError):
        details = [
            {
                "loc": [str(part) for part in error.get("loc", ())],
                "msg": error.get("msg", "Invalid value"),
                "type": error.get("type", "value_error"),
            }
            for error in exc.errors()
        ]
        message = details[0]["msg"] if details else "Invalid request"
        return error_response(422, "VALIDATION_ERROR", message, details)

    @app.exception_handler(HTTPException)
    async def handle_http_exception(_request: Request, exc: HTTPException):
        code = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            409: "CONFLICT",
        }.get(exc.status_code, "HTTP_ERROR")
        return error_response(exc.status_code, code, str(exc.detail))

    @app.exception_handler(Exception)
    async def handle_unexpected_error(_request: Request, _exc: Exception):
        return error_response(500, "INTERNAL_ERROR", "Internal server error")
