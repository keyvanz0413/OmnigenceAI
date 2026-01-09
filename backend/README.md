# OmnigenceAI Backend

## Setup

1. Install dependencies:
   ```bash
   poetry install
   ```

2. Run the server:
   ```bash
   poetry run uvicorn app.main:app --reload
   ```

## Structure

- `app/main.py`: Entry point for the FastAPI application.
- `app/api/`: API routes.
- `app/services/`: Business logic (GCP, LLM, AWS).
- `app/core/`: Configuration and constants.
