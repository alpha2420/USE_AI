# useAI Backend MVP

This is the FastAPI backend for the useAI SaaS product. It provides a RESTful API for user authentication, knowledge base management, WhatsApp integration, and an AI chat interface utilizing OpenAI GPT-4o and RAG.

## Features

- **Authentication:** JWT-based signup and login. User and organization management.
- **Knowledge Upload:** Ingest data via URL scraping, PDF uploads, or manual text insertion.
- **Text Processing & Retrieval (RAG):** Auto-chunking (400 words), embedding generation via `text-embedding-3-small`, and pgvector integration for context retrieval.
- **WhatsApp Integration:** Hooks to manage connections via a Baileys Node.js service.
- **Message Handling:** Fully async webhook endpoints to handle incoming messages from WhatsApp, trigger RAG-assisted replies with ChatGPT-4o, and store conversations in PostgreSQL.

## Tech Stack
- **FastAPI** (Python 3.10+)
- **PostgreSQL** + **pgvector**
- **SQLAlchemy** + **asyncpg** (Async DB Operations)
- **OpenAI** (Embeddings & GPT-4o)
- **Node.js** (External service utilizing the Baileys library)

## Prerequisites

1. Python 3.10+
2. PostgreSQL database with the `pgvector` extension installed.
3. Node.js environment running the Baileys WhatsApp integration service.

## Installation

1. Clone the repository and navigate into the `backend` folder.
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and fill in the corresponding values (Database URL, OpenAI API Key, external WhatsApp service endpoint).

## Database Setup

To install `pgvector` in PostgreSQL, please refer to the [pgvector installation guide](https://github.com/pgvector/pgvector).
Run the application to have SQLAlchemy auto-provision the tables (or use Alembic migrations in a production setup).

## Running the API

Start the local Uvicorn development server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

- `app/main.py`: The entry point for FastAPI.
- `app/config.py`: Managing environment variables via Pydantic settings.
- `app/database.py`: Async PostgreSQL integration setup.
- `app/routes/`: Contains endpoint logic for `auth`, `knowledge`, `whatsapp`, and `chat`.
- `app/services/`: Core logic like the `rag` pipeline, OpenAI wrapper (`embeddings`), web `scraper`, and Baileys Node.js proxy (`whatsapp_service`).
- `app/models/`: SQLAlchemy DB definitions (`user.py`, `conversation.py`) and Pydantic validation schemas (`schemas.py`).
- `app/utils/`: Security operations (`security.py`, `deps.py`) and text utility functions (`chunker.py`).

## Deliverables

- `[x]` Complete FastAPI backend
- `[x]` Working RAG pipeline
- `[x]` Working WhatsApp integration
- `[x]` API documentation (auto-generated via FastAPI's Swagger/ReDoc)
