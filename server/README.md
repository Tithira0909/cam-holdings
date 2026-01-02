# CAM Holdings Server

This is the backend server for the CAM Holdings application, built with Node.js, Express, and MySQL.

## Prerequisites

- Node.js (v14+)
- MySQL (v5.7+ or v8.0+)

## Setup

1.  **Clone the repository** and navigate to the `server` directory.

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Copy `.env.example` to `.env` and configure your database credentials and JWT secret.
    ```bash
    cp .env.example .env
    ```
    Update the values in `.env`:
    - `DB_HOST`: Your MySQL host
    - `DB_USER`: Your MySQL user
    - `DB_PASSWORD`: Your MySQL password
    - `DB_NAME`: Your MySQL database name
    - `JWT_SECRET`: A secure string for signing JWTs

4.  **Database Setup**:
    - Create a database in MySQL matching `DB_NAME`.
    - Run the `schema.sql` script to create tables. You can do this via a MySQL client or CLI:
      ```bash
      mysql -u root -p cam_holdings < schema.sql
      ```

5.  **Run the Server**:
    - Development mode (if you have nodemon):
      ```bash
      npm run dev
      ```
    - Or standard start:
      ```bash
      node index.js
      ```
      (Note: You might need to add a `server.js` or modify `package.json` to start `app.js` listening on a port if not already handled).

## API Endpoints

### Auth
- `POST /api/auth/admin/login`
- `POST /api/auth/client/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Resources (CRUD)
- `/api/users` (Admin only)
- `/api/services`
- `/api/projects`
- `/api/blogs`
- `/api/resources`
- `/api/reviews`
- `/api/inquiries`
- `/api/quotations`
- `/api/settings`

### Dashboard
- `GET /api/admin/dashboard/stats`

## Folder Structure

- `config/`: Database configuration
- `controllers/`: Route logic
- `middleware/`: Auth and utility middleware
- `routes/`: API route definitions
- `utils/`: Helper functions (seeding)
- `uploads/`: Directory for uploaded files
