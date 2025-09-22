const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    duration: { type: String },
    meetingLink: { type: String, required: true },
    
    // --- NEW FIELDS for AI Summaries ---
    // In a real app, this would come from a speech-to-text transcript
    notes: { type: String, default: '' }, 
    summary: { type: String },
    actionItems: [String]
});

module.exports = mongoose.model('Session', SessionSchema);

