const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/mentee', require('./routes/mentee'));
app.use('/api/mentor', require('./routes/mentor'));
app.use('/api/admin', require('./routes/admin'));

// --- SECTION REMOVED ---
// The code that was here for serving static assets in production has been removed
// as your frontend is a separate project.

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

