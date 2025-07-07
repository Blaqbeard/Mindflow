# Mindflow

A full-stack mental wellness application with a Python backend and a React/TypeScript frontend, styled with Tailwind CSS.

## Project Overview

Mindflow is a comprehensive mental wellness app designed to help users track, manage, and improve their mental health. It provides features such as mood tracking, journaling, self-care activities, achievements, and chat support, all accessible via a modern web interface.

---

## Features

- Modular Python backend (FastAPI or similar)
- Modern React frontend (Vite, Tailwind CSS, shadcn/ui)
- Mood tracking and history visualization
- Journaling with rich text editing
- Self-care routines and activities
- Achievements and progress tracking
- Chat support (AI or counselor)
- User authentication and profile management
- Responsive, accessible UI
- Ready for local and live deployment

---

## Architecture

### Frontend

- **Tech Stack:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Key Features:**
  - Authentication
  - Mood tracking
  - Journaling
  - Self-care activities
  - Achievements
  - Chat support
  - Settings & profile
  - Responsive UI
- **Structure:**
  - `src/pages/`: Main app pages (Chat, Journal, SelfCare, Progress, Settings, etc.)
  - `src/components/`: Reusable UI components (MoodSelector, JournalList, CalendarWidget, etc.)
  - `src/app/auth/`: Authentication logic and guards
  - `src/brain/`: AI or chat logic
  - `src/extensions/shadcn/`: Prebuilt UI components
  - `src/utils/`: Utility functions
  - `public/`: Static assets

### Backend

- **Tech Stack:** Python (likely FastAPI), modular API structure
- **Key Features:**
  - Modular APIs for achievements, chat, journal, mood, moods, self-care
  - Authentication and user management
  - Middleware for authentication and other concerns
  - Environment variable configuration
  - Ready for local and production deployment
- **Structure:**
  - `app/apis/`: Endpoints for each feature
  - `app/auth/`: User authentication and management
  - `databutton_app/mw/`: Middleware
  - `requirements.txt`, `pyproject.toml`: Dependency management

---

## User Experience Flow

1. **User Authentication:** Users sign up or log in to access personalized features.
2. **Mood Tracking:** Users select and log their mood, view mood history, and visualize trends.
3. **Journaling:** Users write daily journals, which are stored and can be reviewed or edited.
4. **Self-Care Activities:** Users are presented with self-care routines or activities to support their mental health.
5. **Achievements:** Users unlock achievements for consistent journaling, mood tracking, or self-care engagement.
6. **Chat/Support:** Users can access a chat feature, possibly for AI-powered support or connecting with a counselor.
7. **Settings/Profile:** Users can update their profile and app preferences.

---

## Technical Highlights

- Modern, modular codebase: Easy to extend and maintain
- Clear separation of backend APIs and frontend UI
- Scalable: Ready for both local development and live deployment
- Customizable UI: Tailwind CSS and shadcn/ui
- Security: Authentication and environment variable management

---

## Summary Table

| Area         | Features/Components                                                            |
| ------------ | ------------------------------------------------------------------------------ |
| Mood         | MoodSelector, MoodHistory, mood APIs                                           |
| Journal      | JournalList, RichTextEditor, journal APIs                                      |
| Self-Care    | SelfCare, SelfCareActivity, selfcare APIs                                      |
| Achievements | FeatureCard, achievements APIs                                                 |
| Chat         | Chat page, Brain/AI logic, chat APIs                                           |
| Auth         | Login, UserGuard, backend auth APIs                                            |
| Settings     | Settings page, profile editing                                                 |
| UI/UX        | Tailwind, shadcn/ui, responsive design                                         |
| Backend      | FastAPI (Python), modular APIs, authentication, middleware, environment config |

---

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- Yarn or npm

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Run the backend
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
yarn install  # or npm install
# For development
yarn dev      # or npm run dev
# For production build
yarn build    # or npm run build
```

## Deployment

- Configure environment variables for production.
- Serve the backend with a production server (e.g., Gunicorn/Uvicorn).
- Serve the frontend static files with a web server (e.g., Nginx, Vercel, Netlify).

## License

MIT
