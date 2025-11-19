const jwt = require('jsonwebtoken');

const generateJWTToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role},
        process.env.JWT_SECRET,
        { expiresIn: '1d' } 
    );
};


module.exports = generateJWTToken;
