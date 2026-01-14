# Post - MERN Micro-blogging Application

A full-stack micro-blogging application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **Public Viewing**: Anyone can view posts without authentication
- **Protected Interactions**: Authentication required to create posts, like, and comment
- **Real-time Updates**: WebSocket integration for live post updates
- **JWT Authentication**: Secure authentication using httpOnly cookies
- **Scalable Architecture**: Clean separation of concerns with MVC pattern

## Tech Stack

### Backend
- **Node.js** & **Express** - Server framework
- **MongoDB** - Database
- **JWT** - Authentication (httpOnly cookies)
- **Socket.IO** - Real-time features

### Frontend
- **React** (Vite) - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Socket.IO Client** - Real-time updates

## Project Structure

```
Post/
├── backend/          # Node.js + Express backend
│   └── src/
│       ├── config/   # Database and environment configuration
│       ├── models/   # MongoDB schemas
│       ├── routes/   # API route definitions
│       ├── controllers/ # Business logic
│       ├── middleware/  # Custom middleware
│       ├── sockets/  # WebSocket handlers
│       └── utils/    # Helper functions
│
├── frontend/         # React + Vite frontend
│   └── src/
│       ├── api/      # API configuration
│       ├── components/ # React components
│       ├── context/  # State management
│       ├── pages/    # Page components
│       ├── sockets/  # Socket.IO client
│       └── styles/   # Global styles
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (v6+)
- npm or yarn

### Installation

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts (public)
- `GET /api/posts/:id` - Get single post (public)
- `POST /api/posts` - Create post (protected)
- `PUT /api/posts/:id` - Update post (protected)
- `DELETE /api/posts/:id` - Delete post (protected)
- `POST /api/posts/:id/like` - Like/unlike post (protected)
- `POST /api/posts/:id/comment` - Add comment (protected)

## Development Roadmap

- [ ] Set up dependencies
- [ ] Implement backend authentication
- [ ] Implement backend post CRUD
- [ ] Implement frontend UI components
- [ ] Implement frontend authentication flow
- [ ] Add real-time features with Socket.IO
- [ ] Add pagination and infinite scroll
- [ ] Add user profiles
- [ ] Deploy to production

## License

ISC
