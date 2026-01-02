const jwt = require('jsonwebtoken');

const auth = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.status(401).json({ message: 'Unauthorized' });

        jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
            if (err) return res.status(403).json({ message: 'Forbidden' });

            if (roles.length && !roles.includes(user.role)) {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }

            req.user = user;
            next();
        });
    };
};

module.exports = auth;
