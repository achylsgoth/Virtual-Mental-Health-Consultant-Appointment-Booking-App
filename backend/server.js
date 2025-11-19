require('dotenv').config();
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const passport = require('passport');
const http = require('http');
const googleOAuthConfig = require('./config/googleOAuth');
const cors = require('cors');

const socketIo = require('socket.io'); 
const connectDB = require('./connection/connection');
const authRoutes = require('./routes/authenticationRoutes');
const cookieParser = require('cookie-parser');
const calendarRoutes= require('./routes/calendar');
const therapistRoutes = require('./routes/therapistroute');
const sessionRoutes = require('./routes/sessionRoutes');
const journalRoutes = require('./routes/journalRoutes');
const moodRoutes = require('./routes/moodTrackerRoute');
const feedbackRoutes = require('./routes/feedbackroute');
const PaymentRoutes = require('./routes/paymentRoutes');
const ForumRoutes = require('./routes/forumRoutes');
const reportRoutes = require('./routes/reportRoutes');
const updateRoutes = require('./routes/updateProfileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notification');

// Import the setSocketIO function from notifyAdmin utility
const { setSocketIO } = require('./utils/notifyAdmin');

const socketHandler = require('./middleware/websocketHandler');
const app = express();
connectDB();

const server = http.createServer(app);

//initialize socket.io with the server
const io = socketIo(server, {
    cors:{
        origin:"http://localhost:5173",
        methods:["GET", "POST"],
        credentials:true
    }
});

// Share the io instance with the notifyAdmins utility
setSocketIO(io);

app.set('socketio', io);

//initialize socket authentication and event handlers
socketHandler.initializeSocketIO(io);

const PORT = process.env.PORT || 5555;

app.use(
  session({
      secret: process.env.SESSION_SECRET || 'your_secret_key',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }, // Set to `true` in production with HTTPS
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../backend/uploads')));
app.get('/', (req, res) => {
    res.json({ message: "Server is running!" });
});

// Google OAuth login route
app.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        if (!req.user) {
            return res.redirect('/login');
        }

        console.log("Received state", req.query.state);

        const token = jwt.sign({id: req.user._id, role: req.user.role}, process.env.JWT_SECRET, {expiresIn: "1d"});

        // Store the OAuth2 token in a cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000 // 1 day expiration
        });

        res.redirect('http://localhost:5173/signin');
    }
);

// API Gateway for authentication
app.use('/api/auth', authRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api', therapistRoutes);
app.use('/session', sessionRoutes);
app.use('/journals', journalRoutes);
app.use('/mood', moodRoutes);
app.use('/setting', updateRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/payment', PaymentRoutes);
app.use('/forum', ForumRoutes);
app.use('/report', reportRoutes);
app.use('/admin', adminRoutes);
app.use('/notification', notificationRoutes);

server.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
});