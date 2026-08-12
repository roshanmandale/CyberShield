const asyncHandler = require('express-async-handler');
const Complaint = require('../models/Complaint');
const Evidence = require('../models/Evidence');

const generateComplaintId = () => {
    return 'CYB-' + Math.floor(100000 + Math.random() * 900000);
}

// @desc    Save a complaint
// @route   POST /api/complaints
// @access  Private
const saveComplaint = asyncHandler(async (req, res) => {
    const { crimeType, language, incidentDate, amount, originalDescription, generatedComplaint, status } = req.body;

    const allowedCrimes = ['Online Financial Fraud', 'UPI Fraud', 'Phishing', 'Social Media Scam', 'Account Hacking', 'Cyber Bullying', 'Identity Theft', 'Other'];
    const allowedLangs = ['English', 'Hindi', 'Marathi'];

    if (!crimeType || !allowedCrimes.includes(crimeType)) {
        res.status(400); throw new Error(`Invalid or missing crime type`);
    }
    if (!language || !allowedLangs.includes(language)) {
        res.status(400); throw new Error('Invalid or missing language');
    }
    if (!incidentDate) {
        res.status(400); throw new Error('Incident date is required');
    }
    if (!originalDescription || originalDescription.trim() === '') {
        res.status(400); throw new Error('Incident description is required');
    }
    if (amount && (isNaN(amount) || amount < 0)) {
        res.status(400); throw new Error('Amount must be a non-negative number');
    }

    const complaint = await Complaint.create({
        userId: req.user.id,
        complaintId: generateComplaintId(),
        crimeType,
        language,
        incidentDate,
        amount: amount || 0,
        originalDescription,
        generatedComplaint,
        status: status || 'Draft'
    });

    res.status(201).json(complaint);
});

// @desc    Get user complaints
// @route   GET /api/complaints
// @access  Private
const getUserComplaints = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(complaints);
});

// @desc    Get complaint by id
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = asyncHandler(async (req, res) => {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
        res.status(404);
        throw new Error('Complaint not found');
    }

    // Make sure logged in user matches the complaint user
    if (complaint.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    res.status(200).json(complaint);
});

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private
const updateComplaint = asyncHandler(async (req, res) => {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
        res.status(404);
        throw new Error('Complaint not found');
    }

    // Check user
    if (complaint.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.status(200).json(updatedComplaint);
});

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private
const deleteComplaint = asyncHandler(async (req, res) => {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
        res.status(404);
        throw new Error('Complaint not found');
    }

    // Check user ownership
    if (complaint.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized to delete this complaint');
    }

    await Complaint.findByIdAndDelete(req.params.id);
    res.status(200).json({ id: req.params.id });
});

// @desc    Get dashboard stats
// @route   GET /api/complaints/stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
    const totalComplaints = await Complaint.countDocuments({ userId: req.user.id });
    const totalEvidence = await Evidence.countDocuments({ userId: req.user.id });

    // We fetch recent 5 for dashboard
    const recentComplaints = await Complaint.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(5);

    res.status(200).json({
        totalComplaints,
        totalEvidence,
        totalReports: totalComplaints, // Approximating generated reports mapped to complaints 
        recentComplaints
    });
});

module.exports = {
    saveComplaint,
    getUserComplaints,
    getComplaintById,
    updateComplaint,
    deleteComplaint,
    getDashboardStats,
};
