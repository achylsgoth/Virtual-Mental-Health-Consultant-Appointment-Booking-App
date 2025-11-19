const User = require('../models/User');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer storage for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/avatar');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.userId}-${uniqueSuffix}${ext}`);
  }
});

// Configure upload filter to only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Controller methods
const userProfileController = {
  /**
   * Get current user's profile data
   */
  getUserProfile: async (req, res) => {
    try {
      const userId = req.userId;
      
      // Find user but exclude password field
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error', 
        error: error.message 
      });
    }
  },
  
  /**
   * Update user profile information
   */
  updateProfile: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }
      
      const userId = req.userId;
      const { fullname, email, gender, bio, specializations } = req.body;
      
      // Find user
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Check if email is being changed and if it's already in use
      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email, _id: { $ne: userId } });
        if (emailExists) {
          return res.status(400).json({ 
            success: false, 
            message: 'Email is already in use' 
          });
        }
      }
      
      // Update user fields
      user.fullname = fullname || user.fullname;
      user.email = email || user.email;
      user.gender = gender || user.gender;
      user.bio = bio || user.bio;
      
      // Only update specializations if provided
      if (specializations && Array.isArray(specializations)) {
        user.specializations = specializations;
      }
      
      await user.save();
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          fullname: user.fullname,
          email: user.email,
          gender: user.gender,
          bio: user.bio,
          specializations: user.specializations,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error', 
        error: error.message 
      });
    }
  },
  
  /**
   * Upload avatar
   */
  uploadAvatar: async (req, res) => {
    const uploadSingle = upload.single('avatar');
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          success: false, 
          message: err.message 
        });
      }
      
      try {
        if (!req.file) {
          return res.status(400).json({ 
            success: false, 
            message: 'Please upload an image file' 
          });
        }
        
        const userId = req.userId;
        const user = await User.findById(userId);
        
        if (!user) {
          return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
          });
        }
        
        // If user already has an avatar, delete the old one
        if (user.avatar) {
          const oldAvatarPath = path.join(__dirname, '/avatars', path.basename(user.avatar));
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
          }
        }
        
        // Set new avatar path (relative to public folder)
        user.avatar = `/avatars/${req.file.filename}`;
        await user.save();
        
        res.status(200).json({
          success: true,
          message: 'Avatar uploaded successfully',
          data: {
            avatar: user.avatar
          }
        });
      } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Server error', 
          error: error.message 
        });
      }
    });
  },
  
  /**
   * Change password
   */
  changePassword: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }
      
      const userId = req.userId;
      const { currentPassword, newPassword } = req.body;
      
      // Find user with password
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Check if user has oauth provider (social login)
      if (user.oauthProvider) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot change password for accounts linked to ${user.oauthProvider}` 
        });
      }
      
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      
      await user.save();
      
      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error', 
        error: error.message 
      });
    }
  }
};

module.exports = userProfileController;