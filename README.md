# CAM Holdings

This project contains a public website and an Admin Dashboard to manage projects, blogs, and quotations.

## Project Structure

- `public/` (and root): Static HTML/CSS/JS files for the public website.
- `src/admin/`: React + Vite application for the Admin Dashboard.
- `backend/`: Node.js + Express backend with MySQL database.

## Prerequisites

- Node.js (v14+)
- MySQL Server

## Setup

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    cd backend
    npm install
    cd ..
    ```

3.  **Database Setup**:
    - Ensure MySQL is running.
    - Create a database (e.g., `cam_holdings`).
    - Create a `.env` file in the `backend/` directory with the following credentials:
      ```env
      DB_HOST=localhost
      DB_USER=root
      DB_PASSWORD=yourpassword
      DB_NAME=cam_holdings
      JWT_SECRET=your_jwt_secret
      PORT=3000
      ```
    - Run the setup script to create tables:
      ```bash
      cd backend
      node setup_db.js
      cd ..
      ```
    - *Important*: If you have an existing database, ensure the `users` table has a `role` column. The setup script only creates tables if they do not exist. You may need to run `ALTER TABLE users ADD COLUMN role ENUM('ADMIN', 'CLIENT') NOT NULL DEFAULT 'CLIENT';` manually if upgrading from an older version.
    - *Note*: You may need to seed an admin user manually in the database to log in initially, or use `backend/seed_admin.js` if available (ensure you check/modify it).

## Running Development

To run the system in development mode (with hot-reload for the admin dashboard):

1.  **Start the Backend**:
    ```bash
    cd backend
    npm start
    ```
    (Runs on http://localhost:3000)

2.  **Start the Frontend (Admin Dashboard & Proxy)**:
    Open a new terminal in the root directory:
    ```bash
    npm run dev
    ```
    (Runs on http://localhost:5173)

    - Access the **Admin Dashboard** at: http://localhost:5173/admin/
    - Access the **Public Website** at: http://localhost:5173/

## Building for Production

1.  **Build the Frontend**:
    ```bash
    npm run build
    ```
    This generates the `dist/` directory containing the optimized public site and admin dashboard.

2.  **Serve Production Build**:
    You can serve the `dist/` folder using any static file server or integrate it with the backend to serve static files.
