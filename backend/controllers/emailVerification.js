const User = require("../models/User");
const generateJWTToken = require("../middleware/jwtMiddleware");
    const verifyEmail = async (req, res) => {
        const { code } = req.body; // No role required
        try {
            // Find the user with the matching verification token and expiration time
            const user = await User.findOne({
                verificationToken: code,
                verificationTokenExpiresAt: { $gt: Date.now() },
            });
    
            // If no user is found, return an error
            if (!user) {
                return res
                    .status(400)
                    .json({ success: false, message: "Invalid or expired verification code." });
            }
    
            // Update the user's verification status
            user.isVerified = true;
            user.verificationToken = undefined;
            user.verificationTokenExpiresAt = undefined;
            await user.save();

            const token = generateJWTToken(user._id, user.role);
            res.cookie("token", token, {
                httpOnly: true,   
                secure: process.env.NODE_ENV === "production", // Ensures it's sent over HTTPS in production
                sameSite: "Strict", 
                maxAge: 24 * 60 * 60 * 1000 // 1 day expiration
            });
    
            res.status(200).json({ success: true, message: "Email verified successfully.", user:{
                id: user._id,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                isOnboarded: false
            } });
        } catch (error) {
            console.error("Error verifying email:", error);
            res.status(500).json({ success: false, message: "An error occurred during email verification." });
        }
    };

module.exports = verifyEmail;