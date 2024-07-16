const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req, res, next) => {
    const authorization = req.headers['authorization']; // Use req.headers['authorization']
    if (!authorization) {
        return res.status(401).json({ err: "Token not found" });
    }
    const token = authorization.split(' ')[1]; // Split the authorization header to get the token
    if (!token) {
        return res.status(401).json({ err: "Token invalid" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Invalid token' });
    }
}

const generateToken = (userdata) => {
    return jwt.sign(userdata, process.env.JWT_SECRET);
}

module.exports = { jwtAuthMiddleware, generateToken };
