const express = require('express');
const router = express.Router();
const { auth, isMentee } = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
    getPerformance,
    getMentors,
    getSuggestedMentors,
    sendMentorshipRequest,
    getTasks,
    submitTask,
    getSessions,
    getMessages,
    sendMessage,
    getPerformanceInsights,
    getChatbotResponse,
    getGamificationData,
    getResourceRecommendations // <-- Import new function
} = require('../controllers/menteeController');

// --- (Existing routes remain the same) ---
router.get('/performance', [auth, isMentee], getPerformance);
router.get('/mentors', [auth, isMentee], getMentors);
router.get('/suggested-mentors', [auth, isMentee], getSuggestedMentors);
router.post('/request-mentor', [auth, isMentee], sendMentorshipRequest);
router.get('/tasks', [auth, isMentee], getTasks);
router.post('/submit-task/:taskId', [auth, isMentee], upload.single('file'), submitTask);
router.get('/sessions', [auth, isMentee], getSessions);
router.get('/messages/:mentorId', [auth, isMentee], getMessages);
router.post('/send-message', [auth, isMentee], sendMessage);
router.get('/performance-insights', [auth, isMentee], getPerformanceInsights);
router.post('/chatbot-query', [auth, isMentee], getChatbotResponse);
router.get('/gamification', [auth, isMentee], getGamificationData);

// --- NEW AI-POWERED ROUTE for Recommendations ---
router.get('/recommendations', [auth, isMentee], getResourceRecommendations);

module.exports = router;

