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

# Expose API port
EXPOSE 8000

# Run the API
CMD ["uvicorn", "ttm.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
