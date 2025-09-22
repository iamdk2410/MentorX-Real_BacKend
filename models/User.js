const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['mentee', 'mentor', 'admin'], required: true },
    isApproved: { type: Boolean, default: false },

    menteeDetails: {
        mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        // --- NEW FIELD for Gamification ---
        badges: [{
            name: String,
            description: String,
            icon: String, // Font Awesome icon class, e.g., 'fa-trophy'
            dateEarned: { type: Date, default: Date.now }
        }]
    },
    mentorDetails: {
        specializedCourses: [String],
        mentees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

