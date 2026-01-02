# CAM Holdings - Admin & Client Portal

This project consists of a Node.js/Express backend (using SQLite for this demo environment) and a React/Vite frontend.

## Prerequisites

- Node.js (v16+)
- npm

## Setup & Installation

### 1. Backend Setup

The backend handles authentication, database operations, and API endpoints.

```bash
cd backend
npm install
```

**Configuration:**
Create a `.env` file in the `backend` directory (optional, defaults provided in code for demo):
```env
PORT=5000
JWT_SECRET=supersecretkey
ADMIN_EMAIL=admin@camholdings.com
ADMIN_PASSWORD=admin123
```

**Start the Server:**
```bash
npm start
# Server runs on http://localhost:5000
```
*Note: On first run, it initializes the SQLite database `cam.db` and seeds a default admin user.*

### 2. Frontend Setup

The frontend is a Single Page Application (SPA) built with React.

```bash
cd frontend
npm install
```

**Start the Development Server:**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

## Usage

1.  **Public Site:** Open `index.html` in the root (served via Live Server or similar) to see the main website. Click "LOGIN" in the header.
2.  **Login:**
    -   **Admin:** Use `admin@camholdings.com` / `admin123` (Select "Admin Login" tab).
    -   **Client:** Register a client via API or use Admin to create one (feature in backend), or strictly use Admin for now as per demo.
3.  **Admin Dashboard:** Manage Users, Services, Projects, etc.
4.  **Client Dashboard:** View profile and quotations.

## API Endpoints

-   `POST /api/auth/login` - Login (returns token)
-   `GET /api/users` - List users (Admin only)
-   `GET /api/projects` - List projects
-   ...and more (check `backend/server.js`)

## Tech Stack

-   **Frontend:** React, Vite, Tailwind CSS, Axios, React Router.
-   **Backend:** Node.js, Express, SQLite (production ready schema provided for MySQL transition), JWT, Bcrypt.
