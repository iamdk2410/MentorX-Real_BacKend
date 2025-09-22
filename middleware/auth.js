const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
}

function isMentee(req, res, next) {
    if (req.user.role !== 'mentee') {
        return res.status(403).json({ msg: 'Access denied. Mentees only.' });
    }
    next();
}

function isMentor(req, res, next) {
    if (req.user.role !== 'mentor') {
        return res.status(403).json({ msg: 'Access denied. Mentors only.' });
    }
    next();
}

function isAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }
    next();
}

module.exports = { auth, isMentee, isMentor, isAdmin };
