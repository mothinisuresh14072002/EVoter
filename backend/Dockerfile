FROM python:3.12-slim AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN groupadd --system app && useradd --system --gid app app
USER app

COPY --chown=app:app backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=app:app backend/ ./backend/

ENV PYTHONUNBUFFERED=1

EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
