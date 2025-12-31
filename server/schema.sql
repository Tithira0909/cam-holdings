CREATE DATABASE IF NOT EXISTS cam_holdings;

USE cam_holdings;

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'Admin',
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Insert default super admin if table is empty
-- Password 'secret' hashed with bcrypt (cost 10) is roughly $2a$10$w....
-- But for simplicity, we assume the user will run a seeding script or register via API.
