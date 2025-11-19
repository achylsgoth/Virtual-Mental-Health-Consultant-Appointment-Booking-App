const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized - No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        req.userRole = decoded.role;  // Store role if needed
        next();
    } catch (error) {
        console.log("Error verifying JWT token", error);
        return res.status(403).json({ success: false, message: "Invalid or expired token." });
    }
};


module.exports = verifyToken;