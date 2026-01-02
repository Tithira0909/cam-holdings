# CAM Holdings - Admin Dashboard Backend

This repository contains the backend and frontend setup for the CAM Holdings Admin Dashboard.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MySQL](https://www.mysql.com/)

## Installation

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Database Setup

1.  Create the database and table using the provided schema:
    ```bash
    mysql -u root -p < schema.sql
    ```
    (Or copy the contents of `schema.sql` and run them in your preferred SQL client).

## Configuration

1.  Create a `.env` file in the `server` directory:
    ```bash
    touch .env
    ```

2.  Add the following configuration to `.env`:

    ```env
    PORT=5000

    # Database Configuration
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=cam_holdings

    # JWT Secret
    JWT_SECRET=your_super_secret_key_change_this

    # Fallback Admin Credentials (used if DB connection fails)
    ADMIN_USERNAME=admin@camholdings.com
    ADMIN_PASSWORD=admin
    ```

## Running the Application

1.  Start the server:
    ```bash
    npm start
    ```
    The server will run on `http://localhost:5000`.

2.  Serve the frontend:
    You can use any static file server to serve the root directory. For example, using `serve`:
    ```bash
    npx serve .
    ```
    Or simply open `login.html` in your browser (though API calls might need CORS adjustment if not on the same origin/port, currently backend handles CORS).

## Usage

1.  Go to `login.html`.
2.  Login with the credentials created in the database or the fallback credentials from `.env`.
3.  Access the dashboard at `admin-dashboard.html`.
