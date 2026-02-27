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
