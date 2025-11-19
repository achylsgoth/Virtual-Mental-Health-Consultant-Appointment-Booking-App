// routes/journalRoutes.js
const express = require('express');
const router = express.Router();
const {getJournals, getJournalById, createJournal, updateJournal, deleteJournal, getJournalsByDateRange} = require('../controllers/journal');
const verifyToken = require('../middleware/verifyToken'); // Assuming you have an auth middleware

// Apply auth middleware to all journal routes
router.use(verifyToken);

// Get all journals
router.get('/get', getJournals);

// Get journals by date range
router.get('/date-range', getJournalsByDateRange);

// Get a specific journal
router.get('/:journalId', getJournalById);

// Create a new journal
router.post('/create', createJournal);

// Update a journal
router.put('/:journalId', updateJournal);

// Delete a journal
router.delete('/:journalId', deleteJournal);


//Mood Tracker

module.exports = router;