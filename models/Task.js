const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['assigned', 'submitted', 'completed'], default: 'assigned' },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
