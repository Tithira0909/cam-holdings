# CAM Holdings Project

## Setup Guide

### 1. Prerequisites
- Node.js (v16+)
- MySQL (v5.7+ or v8.0+)

### 2. Database Setup
1. Create a MySQL database named `cam_holdings`.
2. Run `backend/setup_db.js` (if available) or import the schema.
3. Configure `backend/.env` with your database credentials.

### 3. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Start the backend:
   ```bash
   npm start
   ```
   Or for development with nodemon:
   ```bash
   npm run dev
   ```

   The backend runs on `http://localhost:4000`.

### 4. Frontend Setup
1. Navigate to the root directory (where `vite.config.js` is).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

   The frontend runs on `http://localhost:5173`.

### Common Issues
- **Port already in use**: Kill the process using the port (`lsof -i :4000`) or change the port in `.env`.
- **Database access denied**: Check `MYSQL_USER` and `MYSQL_PASSWORD` in `backend/.env`.
- **Backend crash**: Ensure `.env` exists in `backend/` directory and `JWT_SECRET` is set.
- **Proxy errors**: Ensure backend is running before using frontend API calls.
