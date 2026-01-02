const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { login, registerClient } = require('./controllers/authController');
const userController = require('./controllers/userController');
const serviceController = require('./controllers/serviceController');
const projectController = require('./controllers/projectController');
const inquiryController = require('./controllers/inquiryController');
const auth = require('./middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File Upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Ensure uploads dir exists
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);


// --- ROUTES ---

// Auth
app.post('/api/auth/login', login);
app.post('/api/auth/register-client', auth(['admin']), registerClient);

// Users (Admin only)
app.get('/api/users', auth(['admin']), userController.listUsers);
app.post('/api/users', auth(['admin']), userController.createUser);
app.put('/api/users/:id', auth(['admin']), userController.updateUser);
app.delete('/api/users/:id', auth(['admin']), userController.deleteUser);

// Services (Public Read, Admin Write)
app.get('/api/services', serviceController.listServices);
app.post('/api/services', auth(['admin']), serviceController.createService);
app.put('/api/services/:id', auth(['admin']), serviceController.updateService);
app.delete('/api/services/:id', auth(['admin']), serviceController.deleteService);

// Projects (Public Read, Admin Write)
app.get('/api/projects', projectController.listProjects);
app.post('/api/projects', auth(['admin']), upload.array('images', 5), projectController.createProject);
app.put('/api/projects/:id', auth(['admin']), projectController.updateProject);
app.delete('/api/projects/:id', auth(['admin']), projectController.deleteProject);

// Inquiries (Public Write, Admin Read)
app.post('/api/inquiries', inquiryController.submitInquiry);
app.get('/api/inquiries', auth(['admin']), inquiryController.listInquiries);
app.put('/api/inquiries/:id', auth(['admin']), inquiryController.updateInquiryStatus);

// Basic test route
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Start
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
