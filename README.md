# Backend Setup with Admin Dashboard

This project contains a Node.js/Express backend with Admin authentication and a Users management dashboard.

## Prerequisites

- Node.js installed

## Setup

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` directory (if not exists) with the following content:
    ```
    PORT=5000
    ADMIN_USERNAME=admin
    ADMIN_PASSWORD=secret
    JWT_SECRET=supersecretkey
    ```

## Running the Server

Start the server:
```bash
npm start
```
Or for development with auto-restart:
```bash
npm run dev
```

The server runs on `http://localhost:5000` by default.

## API Endpoints

### POST /api/login

Logs in the admin user.

-   **Body**: JSON
    ```json
    {
      "username": "admin",
      "password": "secret"
    }
    ```
-   **Response**: JSON `{"accessToken": "..."}`

### GET /api/admin

Protected route. Verifies token.

### GET /api/users

Protected route. Returns a list of registered admins/users.

-   **Headers**: `Authorization: Bearer <token>`
-   **Response**: JSON Array of User objects.

## Admin Dashboard

Access the dashboard via the frontend at `admin-dashboard.html` (or through the "Admin" link on the home page). You must log in first.
The dashboard features:
- Sidebar navigation.
- Registered Admins list.
- Search functionality.
