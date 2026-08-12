const express = require('express');
const router = express.Router();
const { uploadEvidence, getEvidenceList, verifyEvidence, deleteEvidence } = require('../controllers/evidenceController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/:complaintId', protect, upload.single('file'), uploadEvidence);
router.get('/:complaintId', protect, getEvidenceList);
router.post('/verify/:evidenceId', protect, upload.single('file'), verifyEvidence);
router.delete('/:id', protect, deleteEvidence);

module.exports = router;
