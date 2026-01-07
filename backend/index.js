const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const adminProjectRoutes = require('./routes/admin_projects');
const clientRoutes = require('./routes/clients');
const adminRoutes = require('./routes/admins');
const serviceTypeRoutes = require('./routes/service_types');
const serviceRoutes = require('./routes/services');
const reviewRoutes = require('./routes/reviews');
const dashboardRoutes = require('./routes/dashboard');
const inquiryRoutes = require('./routes/inquiries');
const contactRoutes = require('./routes/contact');
const quotationRoutes = require('./routes/quotations');
const publicQuotationRoutes = require('./routes/public_quotations');
const documentTypeRoutes = require('./routes/document_types');
const projectTaskRoutes = require('./routes/project_tasks');
const blogRoutes = require('./routes/blogs');
const publicApiRoutes = require('./routes/public_api');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Check for JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env file.');
  process.exit(1);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', publicApiRoutes);
app.use('/api/admin/projects', adminProjectRoutes);
app.use('/api/admin/clients', clientRoutes);
app.use('/api/admin/admins', adminRoutes);
app.use('/api/admin/service-types', serviceTypeRoutes);
app.use('/api/admin/services', serviceRoutes);
app.use('/api/admin/reviews', reviewRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/inquiries', inquiryRoutes);
app.use('/api/inquiries', contactRoutes);
app.use('/api/admin/quotations', quotationRoutes);
app.use('/api/quotations', publicQuotationRoutes);
app.use('/api/admin/document-types', documentTypeRoutes);
app.use('/api/admin/project-tasks', projectTaskRoutes);
app.use('/api/admin/blogs', blogRoutes);

// Basic health check
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
