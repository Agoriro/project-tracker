"""Auth DTOs — Pydantic v2 schemas for authentication endpoints."""

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """Credentials for login."""

    username: str = Field(
        ...,
        min_length=3,
        max_length=100,
        examples=["admin"],
        description="Username (case-sensitive)",
    )
    password: str = Field(
        ...,
        min_length=6,
        examples=["admin123"],
        description="Plain-text password",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [{"username": "admin", "password": "admin123"}]
        }
    }


class RegisterRequest(BaseModel):
    """Payload to register a new user."""

    username: str = Field(..., min_length=3, max_length=100, examples=["newuser"])
    password: str = Field(..., min_length=6, examples=["secure_pass_456"])
    full_name: str = Field("", max_length=200, examples=["Jane Doe"])


class TokenResponse(BaseModel):
    """Access token returned after successful login or token refresh."""

    access_token: str = Field(..., description="Short-lived JWT (15 min)")
    token_type: str = Field("bearer", description="Always 'bearer'")


class UserResponse(BaseModel):
    """Public user information returned after registration or profile fetch."""

    id: int
    username: str
    full_name: str
    is_active: bool

    model_config = {"from_attributes": True}
