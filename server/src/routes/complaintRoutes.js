const express = require('express');
const router = express.Router();
const { generateComplaintDraft } = require('../controllers/aiController');
const { saveComplaint, getUserComplaints, getComplaintById, updateComplaint, deleteComplaint, getDashboardStats } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');

router.post('/draft', protect, generateComplaintDraft);
router.post('/', protect, saveComplaint);
router.get('/', protect, getUserComplaints);
router.get('/stats', protect, getDashboardStats);
router.get('/:id', protect, getComplaintById);
router.put('/:id', protect, updateComplaint);
router.delete('/:id', protect, deleteComplaint);

module.exports = router;
