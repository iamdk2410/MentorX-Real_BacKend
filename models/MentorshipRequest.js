const mongoose = require('mongoose');

const MentorshipRequestSchema = new mongoose.Schema({
    mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    goal: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    sent_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MentorshipRequest', MentorshipRequestSchema);
