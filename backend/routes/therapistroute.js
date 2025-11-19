const express = require('express');
const {getAllTherapist, getTherapistById, getTherapistAvailability, addorupdateAvailability, getAuthenticatedTherapistAvailability, deleteAvailability, updateAvailabilityAfterBooking} = require('../controllers/therapistList');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

router.get('/therapist', getAllTherapist);
router.get('/therapist/availability', verifyToken, getAuthenticatedTherapistAvailability);
router.put('/therapist/createAvailability', verifyToken, addorupdateAvailability );
router.delete('/therapist/delete/slot', verifyToken, deleteAvailability);
router.get('/therapist/:id', getTherapistById);
router.put('/updateAvailability', updateAvailabilityAfterBooking)
router.get('/therapist/:id/slots', getTherapistAvailability);






module.exports = router;