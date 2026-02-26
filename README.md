# Titan View / 巨头视野

Titan View is an AI intelligence analysis system that filters and interprets information through the "mindset models" of top entrepreneurs (like Li Ka-shing and Elon Musk).

## Project Structure

- `backend/`: Python FastAPI application for data processing, AI analysis, and API endpoints.
- `frontend/`: Next.js application for the user interface.
- `database/`: Database schema and migration scripts.

## Setup Instructions

### Backend

1.  Navigate to the `backend` directory.
2.  Create a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the application:
    ```bash
    uvicorn main:app --reload
    ```

### Frontend

1.  Navigate to the `frontend` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

## Features

- **Daily Morning Brief**: Structured deep briefing with "Red/Green Light Signals".
- **Cross-Platform Intelligence**: Aggregates data from official news, social media, and tech circles.
- **Ask the Titans**: AI simulated dialogue with different personas.

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Python (FastAPI), SQLAlchemy
- **Database**: MySQL (Production), SQLite (Development)
- **AI**: Volcengine (DeepSeek / Doubao)
