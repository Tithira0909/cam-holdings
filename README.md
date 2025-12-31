# Backend Setup

This project contains a Node.js/Express backend with Admin authentication.

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
(Note: You need to add `"dev": "nodemon index.js"` to scripts in `package.json` manually if you want `npm run dev` to work, or just run `npx nodemon index.js`)

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
-   **Response**: JSON
    ```json
    {
      "accessToken": "eyJhbGci..."
    }
    ```

### GET /api/admin

Protected route. Requires JWT token in Authorization header.

-   **Headers**:
    ```
    Authorization: Bearer <your_access_token>
    ```
-   **Response**: JSON
    ```json
    {
      "message": "Welcome Admin",
      "user": { ... }
    }
    ```
