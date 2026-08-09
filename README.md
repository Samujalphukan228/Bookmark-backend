# Bookmark Manager

Never lose your bookmarks again when switching browsers or devices.

A full-stack bookmark manager: a Rust + Axum REST API with MongoDB, and a Next.js dashboard frontend. Users can register, organize bookmarks into collections and tags, search, and import bookmarks exported from their browser.

## Repository Structure

```
.
├── Bookmark-backend/     # Rust API (Axum + MongoDB)
└── bookmark-frontend/    # Next.js web app
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Rust, Axum 0.7, Tokio, MongoDB |
| Auth | JWT (HS256) in HttpOnly Secure cookies, Bcrypt |
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Tooling | tower-http, tower-governor (rate limiting), GitHub Actions CI |

## Features

- Register / login / logout with JWT auth
- Bookmarks: create, edit, delete, list (paginated), single view
- Collections: group bookmarks, counts, detach-on-delete
- Tags: multiple per bookmark, tag counts, filter by tag
- Search: full-text over title, description, URL, and tags
- Import: browser-exported HTML (Netscape format) with nested folder support

## Getting Started

### Prerequisites

- Rust (latest stable)
- MongoDB (local or Atlas)
- Node.js 20+ and npm

### 1. Backend

```bash
cd Bookmark-backend
cp .env.example .env        # then edit the values
cargo run                   # serves http://localhost:3000
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `3000`) |
| `MONGO_URI` | MongoDB connection string |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret used to sign tokens (generate a random one) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins (e.g. `http://localhost:3001`) |

### 2. Frontend

```bash
cd bookmark-frontend
npm install
npm run dev                 # serves http://localhost:3001
```

The frontend reads the API base URL from `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3000/api`).

## API Reference

See [`Bookmark-backend/Readme.md`](Bookmark-backend/Readme.md) for the full endpoint documentation.

## Development

```bash
cd Bookmark-backend
cargo fmt -- --check        # formatting
cargo clippy --all-targets  # lints
cargo test                  # unit tests
```

```bash
cd bookmark-frontend
npm run lint                # eslint
npm run build               # production build
```

## CI

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs formatting, clippy, tests, and a release build for the backend, plus lint and build for the frontend, on every push to `main` and on pull requests.
