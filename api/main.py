# Vercel entrypoint — re-exports the FastAPI application so that Vercel can
# locate it via the expected `api/main.py` path.
from ttm.api.main import app  # noqa: F401
