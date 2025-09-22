const MentorshipRequest = require('../models/MentorshipRequest');
const User = require('../models/User');
const Task = require('../models/Task');
const TaskSubmission = require('../models/TaskSubmission');
const Performance = require('../models/Performance');
const Message = require('../models/Message');
const Session = require('../models/Session');
const Notification = require('../models/Notification');

// --- (All existing functions remain here) ---
exports.getMenteeRequests = async (req, res) => { try { const requests = await MentorshipRequest.find({ mentor: req.user.id, status: 'pending' }).populate('mentee', 'name email'); res.json(requests); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.manageMenteeRequest = async (req, res) => { const { requestId } = req.params; const { status } = req.body; try { const request = await MentorshipRequest.findByIdAndUpdate(requestId, { status }, { new: true }); if (!request) return res.status(404).json({ msg: 'Request not found' }); const notification = new Notification({ user: request.mentee, message: `Your mentorship request was ${status} by the mentor.` }); await notification.save(); if (status === 'accepted') { await User.findByIdAndUpdate(req.user.id, { $addToSet: { 'mentorDetails.mentees': request.mentee } }); await User.findByIdAndUpdate(request.mentee, { $set: { 'menteeDetails.mentor': req.user.id } }); } res.json({ msg: `Request ${status}` }); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.getMentees = async (req, res) => { try { const mentor = await User.findById(req.user.id).populate('mentorDetails.mentees', 'name email createdAt'); res.json(mentor.mentorDetails.mentees); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.createTask = async (req, res) => { const { menteeId, title, description } = req.body; try { const task = new Task({ mentor: req.user.id, assignedTo: menteeId, title, description }); await task.save(); res.json(task); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.getMenteeSubmissions = async (req, res) => { try { const submissions = await TaskSubmission.find({ mentee: req.params.menteeId, status: 'submitted' }).populate('task', 'title'); res.json(submissions || []); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.reviewTask = async (req, res) => { const { submissionId } = req.params; const { feedback, score } = req.body; try { const submission = await TaskSubmission.findByIdAndUpdate(submissionId, { feedback, score, status: 'reviewed' }, { new: true }); if(!submission) return res.status(404).json({ msg: 'Submission not found.'}); await Task.findByIdAndUpdate(submission.task, { status: 'completed' }); const notification = new Notification({ user: submission.mentee, message: `Your task submission has been reviewed. You scored ${score}.` }); await notification.save(); res.json({ msg: 'Task reviewed and mentee notified.' }); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.getMenteePerformance = async (req, res) => { try { const performance = await Performance.find({ mentee: req.params.menteeId }); res.json(performance || []); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.updatePerformance = async (req, res) => { const { menteeId, course, scores } = req.body; try { let performance = await Performance.findOne({ mentee: menteeId, mentor: req.user.id, course }); if (performance) { performance.scores.push(...scores); } else { performance = new Performance({ mentee: menteeId, mentor: req.user.id, course, scores }); } await performance.save(); res.json(performance); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.getMessages = async (req, res) => { try { const messages = await Message.find({ $or: [ { sender: req.user.id, receiver: req.params.menteeId }, { sender: req.params.menteeId, receiver: req.user.id } ] }).sort('timestamp'); res.json(messages); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.sendMessage = async (req, res) => { const { receiverId, content } = req.body; try { const message = new Message({ sender: req.user.id, receiver: receiverId, content }); await message.save(); res.json(message); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.createSession = async (req, res) => { const { menteeId, title, date, time, duration, meetingLink } = req.body; try { const session = new Session({ mentor: req.user.id, mentee: menteeId, title, date, time, duration, meetingLink }); await session.save(); res.json(session); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.getSessions = async (req, res) => { try { const sessions = await Session.find({ mentor: req.user.id }).populate('mentee', 'name email'); res.json(sessions); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.getAllSubmissions = async (req, res) => { try { const mentor = await User.findById(req.user.id); const menteeIds = mentor.mentorDetails.mentees; const submissions = await TaskSubmission.find({ mentee: { $in: menteeIds } }).sort({ createdAt: -1 }).limit(5).populate('mentee', 'name email').populate('task', 'title'); res.json(submissions); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.getSessionDetails = async (req, res) => { try { const session = await Session.findById(req.params.sessionId).populate('mentee', 'name email'); if (!session) { return res.status(404).json({ msg: 'Session not found.' }); } res.json(session); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.updateSessionNotes = async (req, res) => { try { const session = await Session.findByIdAndUpdate(req.params.sessionId, { notes: req.body.notes }, { new: true }); res.json(session); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };
exports.summarizeSession = async (req, res) => { try { const session = await Session.findById(req.params.sessionId); if (!session || !session.notes) { return res.status(400).json({ msg: 'Session notes are required to generate a summary.' }); } const fetch = (await import('node-fetch')).default; const apiKey = process.env.GEMINI_API_KEY; if (!apiKey) throw new Error("GEMINI_API_KEY is not configured."); const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`; const systemPrompt = "You are an AI assistant. Summarize the following session notes into a brief paragraph. Then, extract the key action items for the mentee into a numbered list. Format the output clearly with 'Summary' and 'Action Items' headings."; const query = `Session Notes:\n\n${session.notes}`; const payload = { contents: [{ parts: [{ text: query }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, }; const geminiResponse = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!geminiResponse.ok) throw new Error('Failed to get summary from AI assistant.'); const result = await geminiResponse.json(); const fullSummary = result.candidates?.[0]?.content?.parts?.[0]?.text || "Could not generate summary."; const summaryMatch = fullSummary.match(/Summary:([\s\S]*?)Action Items:/); const actionItemsMatch = fullSummary.match(/Action Items:([\s\S]*)/); const summary = summaryMatch ? summaryMatch[1].trim() : fullSummary; const actionItems = actionItemsMatch ? actionItemsMatch[1].trim().split(/\d+\.\s/).filter(Boolean) : []; session.summary = summary; session.actionItems = actionItems; await session.save(); res.json({ summary, actionItems }); } catch (err) { console.error('Session Summary Error:', err.message); res.status(500).send('Server error during session summarization.'); } };

// --- NEW AI-POWERED FUNCTION for Sentiment Analysis ---
exports.analyzeSentiment = async (req, res) => {
    try {
        // 1. Get the last 20 messages sent BY THE MENTEE in this conversation
        const recentMessages = await Message.find({
            sender: req.params.menteeId,
            receiver: req.user.id
        }).sort({ createdAt: -1 }).limit(20);

        if (recentMessages.length < 3) {
            return res.json({ sentiment: 'neutral', summary: 'Not enough recent messages from the mentee to analyze sentiment.' });
        }

        const messageText = recentMessages.map(m => m.content).join('\n');

        // 2. Send to Gemini API for analysis
        const fetch = (await import('node-fetch')).default;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const systemPrompt = "Analyze the sentiment of the following messages from a mentee. Classify the overall sentiment as 'positive', 'neutral', or 'negative'. Provide a brief, one-sentence summary explaining your classification. Respond ONLY in JSON format, like this: {\"sentiment\": \"positive\", \"summary\": \"The mentee seems enthusiastic and is asking good questions.\"}";
        const query = `Mentee's Messages:\n\n${messageText}`;
        
        const payload = {
            contents: [{ parts: [{ text: query }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
             generationConfig: { responseMimeType: "application/json" }
        };

        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) throw new Error('Failed to get sentiment from AI assistant.');

        const result = await geminiResponse.json();
        const analysis = JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
        
        res.json(analysis);

    } catch (err) {
        console.error('Sentiment Analysis Error:', err.message);
        res.status(500).send('Server error during sentiment analysis.');
    }
};

