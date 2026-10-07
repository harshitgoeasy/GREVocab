# GRE Vocabulary Builder MVP

This repository contains a lightweight GRE vocabulary learning app with:

- React frontend for the study game
- FastAPI backend for vocab data and endpoints
- LocalStorage-based guest mode for frictionless onboarding
- Optional account prompt for future cloud sync

## Quick start

See [docs/quiz-module.md](docs/quiz-module.md) for quiz module responsibilities, API/session contracts, design decisions, and verification commands.

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
