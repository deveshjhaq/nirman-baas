FROM python:3.12-slim

WORKDIR /workspace

# Install system dependencies for psycopg2 and others
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
RUN pip install .

COPY app/ ./app/

# Environment configurations usually overwritten in compose
ENV PYTHONUNBUFFERED=1

CMD ["celery", "-A", "app.celery", "worker", "-l", "info", "-B"]
