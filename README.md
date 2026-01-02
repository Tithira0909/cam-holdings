# CAM Holdings - Admin Dashboard

This repository contains the backend and frontend setup for the CAM Holdings Admin Dashboard.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)

## Installation

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Database

The project uses a zero-configuration SQLite database (`server/cam.db`). The database file will be created automatically when you start the server for the first time. No manual SQL setup is required.

## Configuration

1.  Create a `.env` file in the `server` directory:
    ```bash
    touch .env
    ```

2.  Add the following configuration to `.env`:

    ```env
    PORT=5000
    JWT_SECRET=your_super_secret_key_change_this

    # Fallback/Default Super Admin (used if DB is empty or fails)
    ADMIN_USERNAME=admin@camholdings.com
    ADMIN_PASSWORD=admin
    ```

## Running the Application

1.  Start the backend server:
    ```bash
    cd server
    npm start
    ```
    The server will run on `http://localhost:5000`.

2.  Serve the frontend:
    Open `login.html` in your browser. (Note: For best results with API calls, serve the root directory using a static server).
    ```bash
    npx serve .
    ```

## Usage

1.  Go to `login.html` (e.g., `http://localhost:3000/login.html`).
2.  Login with:
    - **Username:** `admin@camholdings.com`
    - **Password:** `admin`
3.  Navigate to **Users > Admin Registration** to add new admins.
4.  Navigate to **Users > Registered Admins** to view the list.
