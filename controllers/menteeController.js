const User = require('../models/User');
const Performance = require('../models/Performance');
const MentorshipRequest = require('../models/MentorshipRequest');
const Task = require('../models/Task');
const TaskSubmission = require('../models/TaskSubmission');
const Session = require('../models/Session');
const Message = require('../models/Message');

// --- (All existing functions remain here) ---
exports.getPerformance = async (req, res) => { try { const performance = await Performance.find({ mentee: req.user.id }).populate('mentor', 'name'); res.json(performance); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.getMentors = async (req, res) => { try { const mentors = await User.find({ role: 'mentor', isApproved: true }).select('-password'); res.json(mentors); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.sendMentorshipRequest = async (req, res) => { const { mentorId, message, goal } = req.body; try { const newRequest = new MentorshipRequest({ mentee: req.user.id, mentor: mentorId, message, goal }); await newRequest.save(); res.json({ msg: 'Request sent successfully' }); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.getTasks = async (req, res) => { try { const tasks = await Task.find({ assignedTo: req.user.id }).populate('mentor', 'name'); res.json(tasks); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.submitTask = async (req, res) => { const { taskId } = req.params; const { githubLink } = req.body; const file = req.file; try { const submission = new TaskSubmission({ task: taskId, mentee: req.user.id, githubLink, file: file ? file.path : null }); await submission.save(); await Task.findByIdAndUpdate(taskId, { status: 'submitted' }); res.json({ msg: 'Task submitted successfully' }); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.getSessions = async (req, res) => { try { const sessions = await Session.find({ mentee: req.user.id }).populate('mentor', 'name'); res.json(sessions); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.getMessages = async (req, res) => { try { const messages = await Message.find({ $or: [ { sender: req.user.id, receiver: req.params.mentorId }, { sender: req.params.mentorId, receiver: req.user.id } ] }).sort('timestamp'); res.json(messages); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.sendMessage = async (req, res) => { const { receiverId, content } = req.body; try { const message = new Message({ sender: req.user.id, receiver: receiverId, content }); await message.save(); res.json(message); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.getSuggestedMentors = async (req, res) => { try { const performance = await Performance.find({ mentee: req.user.id }); const weakTopics = new Set(); performance.forEach(record => { record.scores.forEach(score => { if (score.score < 70) { weakTopics.add(record.course); } }); }); const topics = Array.from(weakTopics); if (topics.length === 0) { return res.json([]); } const suggestedMentors = await User.find({ role: 'mentor', isApproved: true, 'mentorDetails.specializedCourses': { $in: topics } }).select('-password').limit(3); res.json(suggestedMentors); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.getPerformanceInsights = async (req, res) => { try { const performanceRecords = await Performance.find({ mentee: req.user.id }); if (performanceRecords.length === 0) { return res.json({ message: "Not enough data for insights yet." }); } const courseStats = {}; performanceRecords.forEach(record => { if (!courseStats[record.course]) { courseStats[record.course] = { totalScore: 0, count: 0, scores: [] }; } record.scores.forEach(s => { courseStats[record.course].totalScore += s.score; courseStats[record.course].count++; courseStats[record.course].scores.push(s.score); }); }); let topSubject = null; let areaToImprove = null; let highestAvg = -1; let lowestAvg = 101; for (const course in courseStats) { const avg = courseStats[course].totalScore / courseStats[course].count; if (avg > highestAvg) { highestAvg = avg; topSubject = course; } if (avg < lowestAvg) { lowestAvg = avg; areaToImprove = course; } } let predictedNextScore = null; if (areaToImprove && courseStats[areaToImprove].scores.length > 1) { const scores = courseStats[areaToImprove].scores; const n = scores.length; let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0; for (let i = 0; i < n; i++) { sumX += i; sumY += scores[i]; sumXY += i * scores[i]; sumX2 += i * i; } const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX); const intercept = (sumY - slope * sumX) / n; predictedNextScore = slope * n + intercept; predictedNextScore = Math.round(Math.max(0, Math.min(100, predictedNextScore))); } res.json({ topSubject: { subject: topSubject, average: Math.round(highestAvg) }, areaToImprove: { subject: areaToImprove, average: Math.round(lowestAvg) }, prediction: { subject: areaToImprove, nextScore: predictedNextScore } }); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.getChatbotResponse = async (req, res) => { const { query } = req.body; if (!query) { return res.status(400).json({ msg: 'Query is required.' }); } const apiKey = process.env.GEMINI_API_KEY; if (!apiKey) { console.error('GEMINI_API_KEY is not set in the .env file.'); return res.status(500).json({ response: "The AI assistant is not configured correctly. Please contact support." }); } try { const fetch = (await import('node-fetch')).default; const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`; const systemPrompt = "You are a friendly and encouraging AI Study Assistant for the MentorX platform. Your goal is to help mentees learn. Answer their questions clearly and concisely. If a question is outside of educational topics, gently guide them back. If you don't know the answer, say so. Use markdown for code snippets and formatting."; const payload = { contents: [{ parts: [{ text: query }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, }; const geminiResponse = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!geminiResponse.ok) { const errorBody = await geminiResponse.text(); console.error('Gemini API Error:', errorBody); throw new Error('Failed to get response from AI assistant.'); } const result = await geminiResponse.json(); const text = result.candidates?.[0]?.content?.parts?.[0]?.text; if (text) { res.json({ response: text }); } else { res.json({ response: "I'm sorry, I couldn't generate a response right now. Please try again." }); } } catch (err) { console.error('Chatbot Controller Error:', err.message); res.status(500).send('Server error while contacting AI assistant.'); } };
exports.getGamificationData = async (req, res) => { try { const menteeId = req.user.id; const user = await User.findById(menteeId); const tasks = await Task.find({ assignedTo: menteeId, status: 'completed' }); const performance = await Performance.find({ mentee: menteeId }); const badges = new Map(user.menteeDetails.badges.map(b => [b.name, b])); let totalScore = 0; let scoreCount = 0; performance.forEach(p => p.scores.forEach(s => { totalScore += s.score; scoreCount++; if (s.score >= 100 && !badges.has('Perfect Score')) { badges.set('Perfect Score', { name: 'Perfect Score', description: 'Achieved a perfect score on a test!', icon: 'fa-star' }); } })); if (scoreCount > 2 && totalScore / scoreCount > 90 && !badges.has('High Achiever')) { badges.set('High Achiever', { name: 'High Achiever', description: 'Maintained an average score above 90!', icon: 'fa-trophy' }); } if (tasks.length >= 5 && !badges.has('Consistent Learner')) { badges.set('Consistent Learner', { name: 'Consistent Learner', description: 'Completed 5 tasks!', icon: 'fa-person-running' }); } const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); if (user.createdAt > oneWeekAgo && tasks.length >= 1 && !badges.has('Quick Starter')) { badges.set('Quick Starter', { name: 'Quick Starter', description: 'Completed your first task within a week!', icon: 'fa-rocket' }); } if (badges.size > user.menteeDetails.badges.length) { user.menteeDetails.badges = Array.from(badges.values()); await user.save(); } res.json({ badges: user.menteeDetails.badges }); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };

// --- CORRECTED Resource Recommendation Function ---
exports.getResourceRecommendations = async (req, res) => {
    try {
        const performance = await Performance.find({ mentee: req.user.id });
        const weakTopics = new Set();
        performance.forEach(record => {
            record.scores.forEach(score => {
                if (score.score < 70) {
                    weakTopics.add(record.course);
                }
            });
        });

        const topics = Array.from(weakTopics);
        if (topics.length === 0) {
            return res.json({ resources: [] });
        }

        const fetch = (await import('node-fetch')).default;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is not configured in your .env file.");

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        const userQuery = `
            Find 3 learning resources from the web for the following topics: ${topics.join(', ')}.
            Respond with ONLY a valid JSON object with a single key "resources".
            Each resource in the "resources" array should be an object with three keys: "title" (string), "url" (string), and "type" (string, e.g., 'Article', 'Video').
            Do not include any other text or markdown formatting around the JSON.
        `;
        
        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            tools: [{ "google_search": {} }]
        };

        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.text();
            console.error('Gemini API Error:', errorBody);
            throw new Error(`AI assistant failed with status ${geminiResponse.status}. Please check the server logs for details.`);
        }

        const result = await geminiResponse.json();
        let resourcesJson = { resources: [] };
        try {
            let responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if(responseText) {
                // --- NEW: Clean the response text ---
                // This regex removes the markdown fences (```json and ```)
                const cleanedText = responseText.replace(/^```json\s*|```$/g, '');
                resourcesJson = JSON.parse(cleanedText);
            } else {
                 throw new Error("AI assistant returned an empty response.");
            }
        } catch (parseError) {
            console.error("Failed to parse Gemini response as JSON:", parseError);
            throw new Error("AI assistant returned an invalid response format.");
        }
        
        res.json(resourcesJson);

    } catch (err) {
        console.error('Resource Recommendation Error:', err.message);
        res.status(500).send(`Server error: ${err.message}`);
    }
};

