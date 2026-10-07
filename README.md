# GRE Vocabulary Builder MVP

This repository contains a lightweight GRE vocabulary learning app with:

- React frontend for the study game
- FastAPI backend for vocab data and endpoints
- LocalStorage-based guest mode for frictionless onboarding
- Optional account prompt for future cloud sync

## Quick start

See [docs/quiz-module.md](docs/quiz-module.md) for quiz module responsibilities, API/session contracts, design decisions, and verification commands.

## Deploy on Render

The root-level `render.yaml` defines two services on the `main` branch:

- `gre-vocab-api`: a Python web service rooted at `backend`, with `/api/health` as its health check.
- `gre-vocab-frontend`: a static Vite site rooted at `frontend`. Its `VITE_API_BASE_URL` is linked to the API service.

To deploy, push the desired commit to `main`, then create a Blueprint in Render and connect this repository. Render will read `render.yaml` and prompt you to create both services. The API runs on Render's free web-service plan and can take a short time to wake after inactivity.

The backend uses Python 3.12 (`backend/.python-version`); the frontend uses Node.js 24.21.0 (`frontend/.node-version`).

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

## MVP flow

1. User enters a guest name and starts immediately.
2. They can browse groups and practice definitions.
3. Progress is saved in browser localStorage.
4. A later account prompt can sync the same session to a real user profile.

## Future upgrade path

- Add Supabase Auth
- Move seed data to PostgreSQL
- Add fill-in-the-blank and multiple-choice rounds
- Add dashboards, streaks, and review queues
