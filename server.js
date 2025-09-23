const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// --- CORRECTED CORS CONFIGURATION ---
// This tells your backend to accept requests specifically from your live frontend.
const corsOptions = {
  origin: 'https://mentorx-app-759e.onrender.com', // Your live frontend URL
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));
// --- END OF CORRECTION ---

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/mentee', require('./routes/mentee'));
app.use('/api/mentor', require('./routes/mentor'));
app.use('/api/admin', require('./routes/admin'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

