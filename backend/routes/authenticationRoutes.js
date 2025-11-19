const express = require('express');
const {registerUser, registerAdmin, loginAdmin, registerTherapist,
    login, 
    forgotPassword,
logout,
resetPassword, 
checkAuth,
getAllUsers} = require('../controllers/userAuth');
const verifyEmail = require('../controllers/emailVerification');
const verifyToken = require('../middleware/verifyToken');
const rateLimit = require('express-rate-limit');
const {onboardTherapist} = require('../controllers/onboardingTherapist');
const onboardClient = require('../controllers/onboardingClient');
const upload = require('../middleware/multerConfig');
const router = express.Router();


const loginLimiter = rateLimit({
    windowMs: 15*60*1000,
    max: 5,
    message: 'Too many login attempts, try again after 15 minutes'
});

//Authentication Routes
router.get("/check-auth", verifyToken, checkAuth);
router.post('/register', registerUser );
router.post("/verify-email", verifyEmail);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get('/users', getAllUsers);



//Admin routes.
router.post('/admin/register', registerAdmin);
router.post('/admin/login', loginAdmin )


//Therapist Routes
router.post('/therapist/register', registerTherapist);



//Onboarding Routes
router.post('/therapist/onboarding',verifyToken, onboardTherapist);

router.post('/client/onboarding',verifyToken, onboardClient);



module.exports = router;