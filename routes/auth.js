const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// --- (Existing routes remain the same) ---
router.get('/', auth, authController.getLoggedInUser);
router.post( '/register', [ check('name', 'Name is required').not().isEmpty(), check('email', 'Please include a valid email').isEmail(), check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }), check('role', 'Role is required').isIn(['mentee', 'mentor', 'admin']) ], authController.register );
router.post( '/login', [ check('email', 'Please include a valid email').isEmail(), check('password', 'Password is required').exists(), check('role', 'Role is required').not().isEmpty() ], authController.login );

// --- NEW ROUTE for Changing Password ---
router.put(
    '/change-password',
    [
        auth, // Protect the route
        check('newPassword', 'New password must be at least 8 characters long').isLength({ min: 8 })
    ],
    authController.changePassword
);

module.exports = router;

