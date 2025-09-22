const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
require('dotenv').config();

// @desc    Register a user
const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, specializedCourses } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // --- CORRECTED USER CREATION LOGIC ---
        // This object will be used to create the new user document.
        const newUserPayload = {
            name,
            email,
            password,
            role,
            // If the role is NOT mentor, approve them instantly.
            // If the role IS mentor, set isApproved to false so the admin can review.
            isApproved: role !== 'mentor',
        };

        // If the new user is a mentor, create the nested mentorDetails object
        // and add the specialized courses to it, as defined in the User.js model.
        if (role === 'mentor') {
            newUserPayload.mentorDetails = {
                specializedCourses: specializedCourses || []
            };
        }

        user = new User(newUserPayload);
        // --- END OF CORRECTION ---

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = {
            user: { id: user.id, role: user.role }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Auth user & get token
const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        if (user.role !== role) {
            return res.status(400).json({ msg: `Please log in using the correct portal for your role.` });
        }
        
        if (role === 'mentor' && !user.isApproved) {
            return res.status(401).json({ msg: 'Your mentor account is pending approval from an admin.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        
        const payload = {
            user: { id: user.id, role: user.role }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                let redirectUrl = '/';
                switch (role) {
                    case 'mentee':
                        redirectUrl = 'mentee/mentee.html';
                        break;
                    case 'mentor':
                        redirectUrl = 'mentor/mentor.html';
                        break;
                    case 'admin':
                        redirectUrl = 'admin/admin.html';
                        break;
                }
                res.json({ token, user, redirectUrl });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Get logged in user
const getLoggedInUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    register,
    login,
    getLoggedInUser
};

