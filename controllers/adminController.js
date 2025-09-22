const User = require('../models/User');
const Log = require('../models/Log');
const MentorshipRequest = require('../models/MentorshipRequest');
const TaskSubmission = require('../models/TaskSubmission');
const Session = require('../models/Session');
const Message = require('../models/Message');
const Performance = require('../models/Performance');

// --- User Management ---
exports.getUsersByRole = async (req, res) => {
    try {
        const { role } = req.query;
        if (!role) return res.status(400).json({ msg: 'Role query parameter is required.' });
        const query = { role };
        if (role === 'mentor') query.isApproved = true;
        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getPendingMentors = async (req, res) => {
    try {
        const pendingMentors = await User.find({ role: 'mentor', isApproved: false }).select('-password');
        res.json(pendingMentors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.approveMentor = async (req, res) => {
    try {
        const mentor = await User.findById(req.params.mentorId);
        if (!mentor || mentor.role !== 'mentor') return res.status(404).json({ msg: 'Mentor not found' });
        mentor.isApproved = true;
        await mentor.save();
        const log = new Log({ user: req.user.id, action: 'approve_mentor', details: `Approved mentor ${mentor.name}` });
        await log.save();
        res.json({ msg: 'Mentor approved successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.rejectMentor = async (req, res) => {
    try {
        const mentor = await User.findById(req.params.mentorId);
        if (!mentor || mentor.role !== 'mentor') return res.status(404).json({ msg: 'Mentor not found' });
        await mentor.deleteOne();
        const log = new Log({ user: req.user.id, action: 'reject_mentor', details: `Rejected mentor ${mentor.name}` });
        await log.save();
        res.json({ msg: 'Mentor registration rejected' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- Data Overview Functions ---

exports.getAllRequests = async (req, res) => {
    try {
        const requests = await MentorshipRequest.find()
            .populate('mentee', 'name')
            .populate('mentor', 'name')
            .sort({ sent_date: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAllSubmissions = async (req, res) => {
    try {
        const submissions = await TaskSubmission.find()
            .populate('mentee', 'name')
            .populate('task', 'title')
            .sort({ createdAt: -1 });
        res.json(submissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find()
            .populate('mentee', 'name')
            .populate('mentor', 'name')
            .sort({ date: -1 });
        res.json(sessions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find()
            .populate('sender', 'name')
            .populate('receiver', 'name')
            .sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAllPerformanceRecords = async (req, res) => {
    try {
        const performance = await Performance.find()
            .populate('mentee', 'name')
            .populate('mentor', 'name')
            .sort({ 'scores.date': -1 });
        res.json(performance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// --- LOGS ---
exports.viewLogs = async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 }).populate('user', 'name');
        res.json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

