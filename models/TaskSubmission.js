const mongoose = require('mongoose');

const TaskSubmissionSchema = new mongoose.Schema({
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    githubLink: { type: String, required: true },
    file: { type: String }, // Path to the uploaded file
    feedback: { type: String },
    score: { type: Number },
    status: { type: String, enum: ['submitted', 'reviewed'], default: 'submitted' }
}, { timestamps: true });

module.exports = mongoose.model('TaskSubmission', TaskSubmissionSchema);
