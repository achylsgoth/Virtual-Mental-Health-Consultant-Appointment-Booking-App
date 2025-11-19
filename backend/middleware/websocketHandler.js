const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Initialize socket.io
exports.initializeSocketIO = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: ' + error.message));
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id}`);
    
    // Join a personal room for targeted notifications
    socket.join(socket.user._id.toString());
    
    // Join admin room if applicable
    if (socket.user.role === 'admin') {
      socket.join('admin-room');
    }
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });
  });

  return io;
};

// Helper function to emit notifications to admins
exports.emitToAdmins = (io, event, data) => {
  io.to('admin-room').emit(event, data);
};

// Helper function to emit notifications to a specific user
exports.emitToUser = (io, userId, event, data) => {
  io.to(userId.toString()).emit(event, data);
};

// Example of integrating WebSockets with notification creation
// Updated notification service to include real-time notifications
exports.createAdminNotificationWithSocket = async (io, type, title, message, relatedId = null, onModel = null) => {
  try {
    const notifications = await this.createAdminNotification(type, title, message, relatedId, onModel);
    
    // Emit to all admins
    exports.emitToAdmins(io, 'notification:new', {
      type,
      title,
      message,
      timestamp: new Date()
    });
    
    return notifications;
  } catch (error) {
    console.error('Error with socket notification:', error);
    throw error;
  }
};
