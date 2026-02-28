# Developer Notes

## Database
The backend has been configured to use **SQLite** (`backend/cam.db`) instead of MySQL due to environment constraints.
- `backend/db.js` uses `sqlite3` driver.
- `backend/setup_sqlite.js` initializes the SQLite database schema.
- To reset DB: `rm backend/cam.db && node backend/setup_sqlite.js`.

## Service Listings
A unified `service_listings` table is used for all property categories (Real Estate, Design, Construction, Interiors).
- API: `/api/service-listings` (Public) and `/api/admin/service-listings` (Admin).
- Frontend: `services/*.html` pages fetch data from this API filtered by category.
- Admin Dashboard: Updates to use the unified API.
