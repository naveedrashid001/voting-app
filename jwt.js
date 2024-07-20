const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req, res, next) => {
    // Extract token from cookies
    const token = req.cookies.authToken;
    
    if (!token) {
        return res.status(401).json({ err: "Token not found" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Invalid token' });
    }
};

const generateToken = (userdata) => {
    return jwt.sign(userdata, process.env.JWT_SECRET);
};

module.exports = { jwtAuthMiddleware, generateToken };
