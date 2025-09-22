const express = require('express');
const router = express.Router();
const { auth, isMentor } = require('../middleware/auth');

const {
    getMenteeRequests,
    manageMenteeRequest,
    getMentees,
    createTask,
    getMenteeSubmissions,
    reviewTask,
    getMenteePerformance,
    updatePerformance,
    getMessages,
    sendMessage,
    createSession,
    getSessions,
    getAllSubmissions,
    getSessionDetails,
    updateSessionNotes,
    summarizeSession,
    analyzeSentiment // <-- Import new function
} = require('../controllers/mentorController');

// --- (Existing routes remain the same) ---
router.get('/requests', [auth, isMentor], getMenteeRequests);
router.post('/requests/:requestId', [auth, isMentor], manageMenteeRequest);
router.get('/mentees', [auth, isMentor], getMentees);
router.post('/create-task', [auth, isMentor], createTask);
router.get('/submissions/:menteeId', [auth, isMentor], getMenteeSubmissions);
router.post('/review-task/:submissionId', [auth, isMentor], reviewTask);
router.get('/performance/:menteeId', [auth, isMentor], getMenteePerformance);
router.post('/update-performance', [auth, isMentor], updatePerformance);
router.get('/messages/:menteeId', [auth, isMentor], getMessages);
router.post('/send-message', [auth, isMentor], sendMessage);
router.post('/create-session', [auth, isMentor], createSession);
router.get('/sessions', [auth, isMentor], getSessions);
router.get('/submissions', [auth, isMentor], getAllSubmissions);
router.get('/session/:sessionId', [auth, isMentor], getSessionDetails);
router.put('/session/:sessionId/notes', [auth, isMentor], updateSessionNotes);
router.post('/session/:sessionId/summarize', [auth, isMentor], summarizeSession);

// --- NEW AI-POWERED ROUTE for Sentiment Analysis ---
router.post('/sentiment/:menteeId', [auth, isMentor], analyzeSentiment);


module.exports = router;

