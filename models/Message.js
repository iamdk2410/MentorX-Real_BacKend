const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    // A field for sentiment, though we'll do on-the-fly analysis for now
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] } 
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);

