const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
require('dotenv').config();

// --- (Existing register, login, getLoggedInUser functions remain the same) ---
const register = async (req, res) => { const errors = validationResult(req); if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); } const { name, email, password, role, specializedCourses } = req.body; try { let user = await User.findOne({ email }); if (user) { return res.status(400).json({ msg: 'User already exists' }); } const newUserPayload = { name, email, password, role, isApproved: role !== 'mentor', }; if (role === 'mentor') { newUserPayload.mentorDetails = { specializedCourses: specializedCourses || [] }; } user = new User(newUserPayload); const salt = await bcrypt.genSalt(10); user.password = await bcrypt.hash(password, salt); await user.save(); const payload = { user: { id: user.id, role: user.role } }; jwt.sign( payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => { if (err) throw err; res.json({ token, user }); } ); } catch (err) { console.error(err.message); res.status(500).send('Server error'); } };
const login = async (req, res) => { const errors = validationResult(req); if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); } const { email, password, role } = req.body; try { let user = await User.findOne({ email }); if (!user) { return res.status(400).json({ msg: 'Invalid Credentials' }); } if (user.role !== role) { return res.status(400).json({ msg: `Please log in using the correct portal for your role.` }); } if (role === 'mentor' && !user.isApproved) { return res.status(401).json({ msg: 'Your mentor account is pending approval from an admin.' }); } const isMatch = await bcrypt.compare(password, user.password); if (!isMatch) { return res.status(400).json({ msg: 'Invalid Credentials' }); } const payload = { user: { id: user.id, role: user.role } }; jwt.sign( payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => { if (err) throw err; let redirectUrl = '/'; switch (role) { case 'mentee': redirectUrl = 'mentee/mentee.html'; break; case 'mentor': redirectUrl = 'mentor/mentor.html'; break; case 'admin': redirectUrl = 'admin/admin.html'; break; } res.json({ token, user, redirectUrl }); } ); } catch (err) { console.error(err.message); res.status(500).send('Server error'); } };
const getLoggedInUser = async (req, res) => { try { const user = await User.findById(req.user.id).select('-password'); res.json(user); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } };


// --- NEW FUNCTION for Changing Password ---
const changePassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if the current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect current password.' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        await user.save();

        res.json({ msg: 'Password updated successfully.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


module.exports = {
    register,
    login,
    getLoggedInUser,
    changePassword // <-- Export the new function
};

