const express = require('express');
const router = express.Router();
const { addMood, getMood, deleteMood } = require('../controllers/moodTracker');
const authenticate = require('../middleware/verifyToken'); // Ensure the user is authenticated

router.post('/add', authenticate, addMood);
router.get('/get', authenticate, getMood);
router.delete('/:moodId', authenticate, deleteMood);

module.exports = router;
