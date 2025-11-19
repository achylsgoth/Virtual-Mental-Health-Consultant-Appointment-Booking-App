const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {createSession, getTherapistSession, cancelSession, updatePrivateNotes,updateSharedNotes, getClientSessions, setSessionStatusToCompleted, deleteSession, getClientSessionsHistory, getSessionNotes} = require('../controllers/sessionBooking');


router.post('/create',verifyToken, createSession);
router.get('/getSession', verifyToken, getTherapistSession);
router.get('/clientSession',verifyToken, getClientSessions);
router.put('/:sessionId/privateNotes', verifyToken, updatePrivateNotes);
router.put('/:sessionId/sharedNotes', verifyToken, updateSharedNotes);
router.get('/client/:clientId/history', verifyToken, getClientSessionsHistory);
router.delete('/delete/:sessionId', verifyToken, deleteSession);
router.put('/status/:sessionId', verifyToken, setSessionStatusToCompleted);
router.post('/cancel/:sessionId', verifyToken, cancelSession);
router.get('/:sessionId/notes', verifyToken, getSessionNotes);
module.exports = router;