const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');

const {
    getUsersByRole,
    getPendingMentors,
    approveMentor,
    rejectMentor,
    viewLogs,
    getAllRequests,
    getAllSubmissions,
    getAllSessions,
    getAllMessages,
    getAllPerformanceRecords
} = require('../controllers/adminController');

// User Management
router.get('/users', [auth, isAdmin], getUsersByRole);
router.get('/pending-mentors', [auth, isAdmin], getPendingMentors);
router.put('/approve-mentor/:mentorId', [auth, isAdmin], approveMentor);
router.delete('/reject-mentor/:mentorId', [auth, isAdmin], rejectMentor);

// Data Overview
router.get('/requests', [auth, isAdmin], getAllRequests);
router.get('/submissions', [auth, isAdmin], getAllSubmissions);
router.get('/sessions', [auth, isAdmin], getAllSessions);
router.get('/messages', [auth, isAdmin], getAllMessages);
router.get('/performance', [auth, isAdmin], getAllPerformanceRecords);


// Logs
router.get('/logs', [auth, isAdmin], viewLogs);

module.exports = router;

