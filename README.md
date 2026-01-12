# Project Name

## Overview
This project is a web application with a frontend built using Vite and a backend built with Node.js and Express. It features a dashboard for managing clients, projects, services, and settings.

## Backend

### Setup
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file based on `.env.example`.
4.  (Optional) Setup database:
    ```bash
    node setup_db.js
    ```
    *Note: Requires a running MySQL server.*

### Running
To start the backend server:
```bash
npm start
```
The server will run on port 3000 by default.

## Frontend

### Setup
1.  Navigate to the root directory.
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running
To start the development server:
```bash
npm run dev
```

## Features
-   **Dashboard:** View statistics and analytics.
-   **Admin Management:** Manage admin users.
-   **Settings:** Configure site, analytics, and email settings.
-   **Projects & Clients:** Manage project and client data.

## API Endpoints
-   `GET /api/admin/dashboard/stats`: Get dashboard statistics.
-   `GET /api/admin/admins`: Get list of admins.
-   `GET /api/admin/settings/*`: Get specific settings.
