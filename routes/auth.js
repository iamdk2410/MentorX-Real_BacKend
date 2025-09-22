const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
// Correctly destructure to get the specific 'auth' middleware function
const { auth } = require('../middleware/auth');

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
// This route now receives the correct 'auth' function and will work as expected
router.get('/', auth, authController.getLoggedInUser);

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
        check('role', 'Role is required').isIn(['mentee', 'mentor', 'admin'])
    ],
    authController.register
);

// @route   POST api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
        check('role', 'Role is required').not().isEmpty()
    ],
    authController.login
);

module.exports = router;

