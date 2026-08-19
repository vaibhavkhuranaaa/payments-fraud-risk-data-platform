FROM ghcr.io/astral-sh/uv:0.11.29 AS uv
FROM python:3.12-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY --from=uv /uv /uvx /bin/

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY src/__init__.py src/api.py ./src/
COPY data/validated/evaluation.json ./data/validated/evaluation.json

EXPOSE 8000
CMD ["/bin/sh", "-c", "exec /app/.venv/bin/uvicorn src.api:app --host 0.0.0.0 --port ${PORT:-8000}"]
