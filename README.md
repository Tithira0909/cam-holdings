# Backend Setup with Admin Dashboard

This project contains a Node.js/Express backend with Admin authentication, MySQL integration, and a Users management dashboard.

## Prerequisites

- Node.js installed
- MySQL Server installed and running

## Database Setup

1.  Log in to your MySQL server.
2.  Create the database and tables using the `server/schema.sql` file.
    ```bash
    mysql -u root -p < server/schema.sql
    ```
    (Or copy-paste the SQL content into your MySQL client).

## Setup

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` directory (if not exists) with the following content (adjust DB credentials as needed):
    ```
    PORT=5000
    ADMIN_USERNAME=admin
    ADMIN_PASSWORD=secret
    JWT_SECRET=supersecretkey
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=cam_holdings
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

Logs in the admin user. Authenticates against the MySQL database (`admins` table).
Falls back to `.env` credentials if DB fails or user not found (for initial setup).

-   **Body**: JSON `{"username": "email@example.com", "password": "..."}`
-   **Response**: JSON `{"accessToken": "..."}`

### POST /api/register-admin

Registers a new admin.

-   **Headers**: `Authorization: Bearer <token>`
-   **Body**: JSON `{"firstName": "...", "lastName": "...", "email": "...", "password": "...", "role": "..."}`

### GET /api/users

Returns a list of registered admins/users from the database.

-   **Headers**: `Authorization: Bearer <token>`
-   **Response**: JSON Array of User objects.

## Admin Dashboard

Access the dashboard via `admin-dashboard.html`.
-   **Registered Admins**: View list of admins.
-   **Admin Registration**: Form to add new admins.
