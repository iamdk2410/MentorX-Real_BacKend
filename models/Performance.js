const mongoose = require('mongoose');

const PerformanceSchema = new mongoose.Schema({
    mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: String, required: true },
    scores: [{
        testName: String,
        score: Number,
        date: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('Performance', PerformanceSchema);
