"""JWT and password utilities — infrastructure layer auth helpers."""

from datetime import UTC, datetime, timedelta

import bcrypt
import jwt

from app.config import settings

ALGORITHM = "HS256"


# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------

def hash_password(plain: str) -> str:
    """Return bcrypt hash of a plain-text password."""
    # Ensure it's a string, then encode and hash, and decode back to string for DB storage
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if plain matches hashed."""
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------

def _create_token(data: dict, expires_delta: timedelta) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(UTC) + expires_delta
    payload["iat"] = datetime.now(UTC)
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def create_access_token(username: str) -> str:
    """Create a short-lived access token (15 min by default)."""
    return _create_token(
        {"sub": username, "type": "access"},
        timedelta(minutes=settings.access_token_expire_minutes),
    )


def create_refresh_token(username: str) -> str:
    """Create a long-lived refresh token (7 days by default)."""
    return _create_token(
        {"sub": username, "type": "refresh"},
        timedelta(days=settings.refresh_token_expire_days),
    )


def decode_token(token: str) -> dict:
    """Decode and validate a JWT. Raises jwt.PyJWTError on failure."""
    return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
