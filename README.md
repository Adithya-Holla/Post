# Post

A full‑stack micro‑blogging application built with MongoDB, Express, React (Vite), and Node.js.

The backend exposes a REST API (cookie-based JWT auth) and emits basic Socket.IO events for post interactions.

## Features

- Authentication with JWT stored in an HttpOnly cookie
- Create, edit, and delete posts (280 character limit)
- Like/unlike posts
- Comment on posts and fetch comments per post
- Profile avatar upload (stored in MongoDB)
- Socket.IO events for interaction updates (like/comment)

## Tech Stack

- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Socket.IO, Multer
- Frontend: React, Vite, React Router, Axios, Tailwind CSS

## Repository Layout

```
Post/
  backend/           # Express API + MongoDB + Socket.IO
  frontend/          # React (Vite) client
  README.md
```

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend

1. Install dependencies:

	```bash
	cd backend
	npm install
	```

2. Create `backend/.env`:

	```env
	PORT=4000
	NODE_ENV=development
	MONGODB_URI=mongodb://localhost:27017/post-app
	JWT_SECRET=change-me
	JWT_EXPIRE=7d
	COOKIE_SECURE=false
	CLIENT_URL=http://localhost:5173
	```

3. Start the API server:

	```bash
	npm run dev
	```

The health check is available at `GET /health`.

### Frontend

1. Install dependencies:

	```bash
	cd frontend
	npm install
	```

2. Ensure the API base URL points to your backend.

	The Axios instance is configured in `frontend/src/api/axios.js`. By default it targets `http://localhost:4000/api`.

3. Start the dev server:

	```bash
	npm run dev
	```

## API Overview

Base path: `/api`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (protected)
- `POST /api/auth/logout`
- `POST /api/auth/avatar` (protected, form-data field: `avatar`)

### Posts

- `GET /api/posts` (public)
- `POST /api/posts` (protected)
- `PUT /api/posts/:id` (protected)
- `DELETE /api/posts/:id` (protected)
- `POST /api/posts/:id/like` (protected)
- `GET /api/posts/:id/comments` (public)
- `POST /api/posts/:id/comments` (protected)

## Deployment Notes (Render)

This repo is structured as two services:

- Backend: Render Web Service (Node)
- Frontend: Render Static Site (Vite build)

Minimum backend environment variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL` (set to the deployed frontend URL)
- `COOKIE_SECURE=true` in production

Notes:

- Avatars are stored in MongoDB and returned as a `data:` URL, so deployment does not depend on the server filesystem.

## License

ISC
