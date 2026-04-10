# Vercel serverless entrypoint — re-exports the FastAPI app from the ttm package
# so that Vercel can locate it at the expected `api/main.py` path.
from ttm.api.main import app  # noqa: F401
