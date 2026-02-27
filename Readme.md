# Bookmark Manager API

A REST API for managing bookmarks built with Rust, Axum, and MongoDB.

Never lose your bookmarks again when switching browsers or devices.

---

## Tech Stack

- Language: Rust
- Framework: Axum 0.7
- Database: MongoDB
- Auth: JWT + HttpOnly Cookies
- Password Hashing: Bcrypt
- Runtime: Tokio
- Serialization: Serde

---

## Features

### Authentication

- Register user
- Login user
- Logout user
- JWT authentication
- HttpOnly cookies (XSS protected)

### Bookmarks

- Create bookmark
- Edit bookmark
- Delete bookmark
- List bookmarks
- View single bookmark

### Collections

- Create collection
- Rename collection
- Delete collection
- View bookmarks inside collections

### Tags

- Multiple tags per bookmark
- Filter bookmarks by tag
- List all tags

### Search

Search bookmarks by:

- Title
- Description
- URL
- Tags

### Import

- Import bookmarks from browser export HTML
- Automatic collection creation

---

## Project Structure

src/
├── main.rs
├── config/
│ └── env.rs
├── db/
│ └── mongo.rs
├── state/
│ └── app_state.rs
├── errors/
│ └── app_error.rs
├── models/
│ ├── user.rs
│ ├── bookmark.rs
│ └── collection.rs
├── handlers/
│ ├── auth.rs
│ ├── bookmark.rs
│ ├── collection.rs
│ ├── tag.rs
│ ├── search.rs
│ └── import.rs
├── routes/
│ ├── auth.rs
│ ├── bookmark.rs
│ ├── collection.rs
│ ├── tag.rs
│ ├── search.rs
│ └── import.rs
├── middleware/
│ └── auth.rs
└── utils/
└── jwt.rs


---

## Getting Started

### Requirements

Install:

- Rust (latest stable)
- MongoDB

Check versions:

rustc --version
mongod --version


---

## Installation

### 1 Clone Repository

git clone https://github.com/Samujalphukan228/Bookmark-backend

cd bookmark-backend


---

### 2 Create Environment File

cp .env.example .env


---

### 3 Configure Environment

Edit `.env`:

PORT=3000
MONGO_URI=mongodb://localhost:27017
DB_NAME=bookmarkdb
JWT_SECRET=your_super_secret_key_change_this_in_production


---

### 4 Run Server

cargo run


Server runs at:

http://localhost:3000


---

## API Endpoints

### Auth

| Method | Route | Description | Auth Required |
|-------|------|-------------|---------------|
POST | /api/auth/register | Register new user | No
POST | /api/auth/login | Login user | No
POST | /api/auth/logout | Logout user | No
GET | /api/me | Get current user | Yes

---

### Bookmarks

| Method | Route | Description | Auth Required |
|-------|------|-------------|---------------|
POST | /api/bookmarks | Create bookmark | Yes
GET | /api/bookmarks | List bookmarks | Yes
GET | /api/bookmarks/:id | Get bookmark | Yes
PUT | /api/bookmarks/:id | Update bookmark | Yes
DELETE | /api/bookmarks/:id | Delete bookmark | Yes

---

### Collections

| Method | Route | Description | Auth Required |
|-------|------|-------------|---------------|
POST | /api/collections | Create collection | Yes
GET | /api/collections | List collections | Yes
GET | /api/collections/:id | Get collection | Yes
PUT | /api/collections/:id | Update collection | Yes
DELETE | /api/collections/:id | Delete collection | Yes

---

### Tags

| Method | Route | Description | Auth Required |
|-------|------|-------------|---------------|
GET | /api/tags | List tags | Yes
GET | /api/tags/bookmarks?tag=xxx | Get bookmarks by tag | Yes

---

### Search

| Method | Route | Description | Auth Required |
|-------|------|-------------|---------------|
GET | /api/search?q=xxx | Search bookmarks | Yes

---

### Import

| Method | Route | Description | Auth Required |
|-------|------|-------------|---------------|
POST | /api/import | Import bookmarks HTML | Yes

---

## Example Requests

### Register

Request:

POST /api/auth/register


Body:

```json
{
 "email": "user@example.com",
 "password": "password123"
}

Response:

{
 "id": "object_id",
 "email": "user@example.com",
 "created_at": "2026-01-01T00:00:00Z"
}

Login

Request:
POST /api/auth/login

Body:
{
 "email": "user@example.com",
 "password": "password123"
}

Response:

{
 "id": "object_id",
 "email": "user@example.com"
}

Cookie automatically set:

token=<jwt_token>
Create Bookmark

Request:

POST /api/bookmarks

Body:

{
 "title": "GitHub",
 "url": "https://github.com",
 "description": "Code hosting platform",
 "tags": ["dev","code"],
 "collection_id": "object_id"
}

Response:

{
 "id": "object_id",
 "title": "GitHub",
 "url": "https://github.com",
 "description": "Code hosting platform",
 "tags": ["dev","code"],
 "collection_id": "object_id",
 "created_at": "2026-01-01T00:00:00Z",
 "updated_at": "2026-01-01T00:00:00Z"
}
Environment Variables
Variable	Description	Default
PORT	Server port	3000
MONGO_URI	MongoDB connection	mongodb://localhost:27017
DB_NAME	Database name	bookmarkdb
JWT_SECRET	JWT secret key	Required
Security

Passwords hashed with Bcrypt

JWT stored in HttpOnly cookies

XSS protected

Users can only access their own data

Import Bookmarks

1 Open Chrome/Brave/Firefox/Edge
2 Go to Bookmark Manager
3 Click Export Bookmarks
4 Save HTML file
5 POST file to /api/import

Collections will be created automatically.

License

MIT


---

Also copy these:

---

### `.env.example`


PORT=3000
MONGO_URI=mongodb://localhost:27017
DB_NAME=bookmarkdb
JWT_SECRET=your_super_secret_key_change_this_in_production


---

### `.gitignore`


target/
.env
*.log


---

This README is **GitHub-ready and professional.**

Next best step:

**JWT Auth + Cookies (real production auth)** — the most important backend skill.