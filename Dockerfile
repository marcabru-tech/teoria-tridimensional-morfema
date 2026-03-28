# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry

# Copy configuration files
COPY pyproject.toml poetry.lock* ./

# Configure poetry to not create virtual env inside docker
# and install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-root

# Copy application code
COPY . .

# Install the app itself
RUN poetry install --no-interaction --no-ansi

# Create a non-root user and switch to it
RUN adduser --disabled-password --gecos "" ttmuser
USER ttmuser

# Expose API port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD /usr/local/bin/python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1

# Run the API (hot-reload disabled by default; set TTM_RELOAD=true for development)
CMD ["uvicorn", "ttm.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
