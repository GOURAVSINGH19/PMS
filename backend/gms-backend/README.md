# GMS Backend - Goal Management System

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

4. Run the application:
```bash
uvicorn app.main:app --reload
```

5. Access API docs: http://localhost:8000/docs

## Project Structure

```
app/
├── routers/        # API route handlers
├── services/       # Business logic layer
├── repositories/   # Data access layer
├── models/         # SQLAlchemy models
├── schemas/        # Pydantic schemas
├── config.py       # Configuration
├── database.py     # Database setup
├── enums.py        # Enums for status/roles
└── main.py         # FastAPI app
```

## Architecture

**3-Layer Architecture:**
- **Routers**: Handle HTTP requests/responses, validation
- **Services**: Business logic, orchestration
- **Repositories**: Database operations, queries

## Next Steps

1. Add Goal model with hierarchy support
2. Add Progress tracking model
3. Add Feedback and Score models
4. Implement workflow state transitions
5. Add authentication/authorization
6. Implement at-risk goal detection
7. Build dashboard aggregations
