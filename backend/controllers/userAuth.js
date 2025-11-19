const bcrypt = require('bcrypt'); // For hashing passwords
const Therapist = require('../models/therapistDB');
const Admin = require('../models/admindb');
const Client = require('../models/clientdb');
const {sendVerificationEmail, sendPasswordResetEmail, sendResetSuccessEmail} = require('../mailtrap/sendEmail');
const User = require('../models/User');
const generateJWTToken = require('../middleware/jwtMiddleware');
const crypto = require('crypto');
const { DefaultSerializer } = require('v8');
const passport = require("passport");

const registerUser = async (req, res) => {
    const { username, fullname, email, password, oauthProvider, oauthId, role} = req.body;

    try {
        //Validate Role.
        if (!role || (role !== 'client' && role !== 'therapist')) {
            return res.status(400).json({ message: 'Invalid role. Role must be either "client" or "therapist".' });
        }

        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        // Check if the username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username is already taken.' });
        }

        // Hash password for non-OAuth users
        let hashedPassword = null;
        if (!oauthProvider) {
            if (!password) {
                return res.status(400).json({ message: 'Password is required for non-OAuth users.' });
            }
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const verificationToken = oauthProvider ? null : Math.floor(100000 + Math.random() * 900000).toString();

        

        // Create user based on role.
        const userData = {
            username,
            fullname,
            email,
            password: hashedPassword, // Null for OAuth users
            oauthProvider: oauthProvider || null,
            oauthId: oauthId || null,
            role, 
            verificationToken,
            verificationTokenExpiresAt: oauthProvider? null :  Date.now() + 24 * 60 * 60 * 1000,// 24 hours
        };

        const newUser = role === "client"? new Client(userData) : new Therapist(userData)
        
        await newUser.save();

        if(!oauthProvider){
            await sendVerificationEmail(newUser.email, verificationToken);
        }
       
        const userResponse = {
            username: newUser.username,
            fullname: newUser.fullname,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt,
            verificationToken: newUser.verificationToken
        };

        res.status(201).json({ message: 'Registration successful!', user: userResponse });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred during registration.' });
    }
};


//Registration Logic for Therapists.
const registerTherapist = async (req, res) => {
    const {username, fullname, email, password} = req.body;

    try{
        const existingTherapist = await Therapist.findOne({email});
        if(existingTherapist){
            return res.status(400).json({success: false, message:"User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken =  Math.floor(100000 + Math.random() * 900000).toString();

        const newTherapist = new Therapist({
            username,
            fullname, 
            email,
            password: hashedPassword,
            role:'therapist',
            isOnboarded: false,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,

        });

        await newTherapist.save();
        await sendVerificationEmail(newTherapist.email, verificationToken);

        therapistResponse={
            username: newTherapist.username,
            fullname: newTherapist.fullname, 
            email: newTherapist.email,
            role: newTherapist.role,
            isOnboarded: false,
            verificationToken: newTherapist.verificationToken,
            verificationTokenExpiresAt: newTherapist.verificationTokenExpiresAt
          
        }
        res.status(201).json({success: true, message:"New Therapist registered successfully", user: therapistResponse});
    } catch (err) {
        console.log('error occured during registration process', err);
        res.status(500).json({ message: 'An error occurred during registration.' });
    }

};



//Registration logic for Admin.
const registerAdmin = async (req, res) => {
    const {name, email, password} = req.body;

    try{
        const existingAdmin = await Admin.findOne({email});
        if(existingAdmin) {
            return res.status(400).json({message: 'Admin email is already registered.'});
        }
        //Hash password.
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            name, 
            email,
            password: hashedPassword,
            role:'Admin',
        });

        await newAdmin.save();

        res.status(201).json({ message: 'Admin registered successfully!', admin: {name: newAdmin.name, email:newAdmin.email}});

    }catch ( err){
        console.error(err);
        res.status(500).json({message:'An error occured during admin registration.'});
    }

};

//Admin Login
const loginAdmin = async (req, res) => {
    const {email, password} = req.body;

    try{
        const admin = await Admin.findOne({email}).select('+password');
        if(!admin){
            return res.status(400).json({success: false, message:'Invalid credentials'});
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if(!isPasswordValid){
            return res.status(400).json({success: false, message:"Invalid credentials"});
        }

        const token = generateJWTToken(admin._id, admin.role);
        res.cookie("token", token, {
            httpOnly: true,   // Prevents client-side access to the cookie
            secure: process.env.NODE_ENV === "production", // Ensures it's sent over HTTPS in production
            sameSite: "Strict", // Prevents CSRF attacks
            maxAge: 24 * 60 * 60 * 1000 // 1 day expiration
        });
        res.status(200).json({success: true, message:'Admin login successful', token, admin:{
            name: admin.name, email: admin.email, role: admin.role
        }});
    }catch (err) {
        console.error(err);
        res.status(500).json({success: false, message:'An error occured during login!'});
    }
};



//Login
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user in the User collection
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid Credentials" });
        }

        //Oauth Handling
        if (user.oauthProvider) {
            return res.status(400).json({success: false, message: "please log in using your google account."});
        }
        

        // Validate the password
        const isPasswordValid =  await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid Credentials" });
        }

        // Generate JWT token
        const token = generateJWTToken(user._id, user.role);
        console.log(user._id);
          // Set token in HTTP-only cookie
          res.cookie("token", token, {
            httpOnly: true,   // Prevents client-side access to the cookie
            secure: process.env.NODE_ENV === "production", // Ensures it's sent over HTTPS in production
            sameSite: "Strict", // Prevents CSRF attacks
            maxAge: 24 * 60 * 60 * 1000 // 1 day expiration
        });
       

        user.lastLogin = new Date();
        await user.save();

        const userResponse= {
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            isOnboarded:user.isOnboarded,
            lastLogin: user.lastLogin,
            isVerified: user.isVerified
        };
        
        res.status(200).json({ success:true, message: 'Login successful', token, user: userResponse});
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred during login.' });
    }
};








// Controller for logout
const logout = async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully.' });
};

//Logic for forgot Password.
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try{
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({success: false, message: "User not found" });
        }

        //Generate reset link
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; //1hour

        user.passwordResetToken = resetToken;
        user.passwordResetTokenExpiresAt = resetTokenExpiresAt;

        await user.save();

        //send email
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({ success: true, message:"Password reset link sent to your email"});
    } catch (error) {
        res.status(400).json({success: false, message:"failed to send reset link."});
    }
};

//Reset Password
const resetPassword = async ( req, res) => {
    try{
        const {token} = req.params;
        const {password} = req.body;

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetTokenExpiresAt: { $gt: Date.now()},
        });

        if(!user){
            return res.status(400).json({ success:false, message:"Invalid or expired reset token"});
        }

        //update password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiresAt= undefined;
        await user.save();

        await sendResetSuccessEmail(user.email);
        res.status(200).json({ success: true, message:"Password reset successfully"});

    } catch (error) {
        res.status(400).json({error, message:"password reset failed."});
    }

};


const checkAuth = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized - no token" });
        }

        const user = await User.findById(req.userId).select("-password");
  
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user});
    } catch (error) {
        console.log("Error in checkAuth", error);
        res.status(400).json({ success: false, message: error.message });
    }
};


// Function to get a list of all users
const getAllUsers = async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await User.find().select('-password'); // Exclude password field

        // Check if there are any users
        if (!users || users.length === 0) {
            return res.status(404).json({ success: false, message: 'No users found.' });
        }

        // Return the list of users
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching users.' });
    }
};

module.exports = {
    registerUser,
    registerTherapist,
    registerAdmin,
    loginAdmin, // Unified registration handler
    login,        // Login handler
    logout,       // Logout handler
    forgotPassword, //forgot password
    resetPassword,
    checkAuth,
    getAllUsers
};
