const User = require('../models/User');
const Availability = require('../models/availability');
const {notifyAdmins} = require('../utils/notifyAdmin');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/docs'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage }).fields([
  { name: 'resume', maxCount: 1 },
  { name: 'professionalLicense', maxCount: 1 },
]);

// Onboard Therapist with File Uploads
const onboardTherapist = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: 'File upload failed', error: err.message });
      }

      const {
        therapistType,
        licenseNumber,
        licenseIssuer,
        licenseExpiry,
        specializations,
        education,
        slots,
        sessionPrice,
        languages,
        paymentDetails
      } = req.body;

      const userId = req.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Validate license number for clinical therapists
      if (therapistType === 'clinical' && !licenseNumber) {
        return res.status(400).json({
          success: false,
          message: 'License number is required for clinical therapists.'
        });
      }

      // Set qualification proofs
      user.qualificationProof = {
        resume: req.files['resume'] ? `uploads/docs/${path.basename(req.files['resume'][0].path)}` : null,
        professionalLicense: req.files['professionalLicense'] ? `uploads/docs/${path.basename(req.files['professionalLicense'][0].path)}` : null,
      };
      
      // Set new therapist fields
      user.therapistType = therapistType;
      user.licenseNumber = licenseNumber || null;
      user.licenseIssuer = licenseIssuer || null;
      user.licenseExpiry = licenseExpiry ? new Date(licenseExpiry) : null;

      user.specializations = JSON.parse(specializations);
      user.education = JSON.parse(education);
      user.sessionPrice = JSON.parse(sessionPrice);
      user.languages = JSON.parse(languages);
      user.paymentDetails = JSON.parse(paymentDetails);
      user.isOnboarded = true;

      await user.save();

      const availabilityData = JSON.parse(slots);
      const newAvailability = new Availability({
        therapistId: user._id,
        slots: availabilityData,
        timezone: availabilityData.timezone,
      });

      await newAvailability.save();
    
     //notify admins
     try{
      await notifyAdmins({
        type:'therapist',
        title:'New Therapist Onboarded',
        message:`${user.fullname} has completed the onboarding process as a ${therapistType} therapist.`,
        relatedId: user._id,
        onModel:'User'
      }) 
     }catch (notificationError){
      console.error('Failed to send admin notification: ', notificationError);
     }

      res.status(200).json({
        success: true,
        message: 'Therapist onboarding completed successfully!',
        data: {
          therapist: user,
          availability: newAvailability,
        },
      });
    });
  } catch (error) {
    console.error('Error during therapist onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to onboard therapist',
      error: error.message,
    });
  }
};

module.exports = {
  onboardTherapist
};
