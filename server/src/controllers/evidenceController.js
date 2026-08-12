const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Evidence = require('../models/Evidence');
const Complaint = require('../models/Complaint');
const { cloudinaryUploadBuffer, cloudinaryDestroy } = require('../utils/cloudinaryUpload');

// @desc    Upload evidence for a complaint
// @route   POST /api/evidence/:complaintId
// @access  Private
const uploadEvidence = asyncHandler(async (req, res) => {
    const complaintId = req.params.complaintId;
    const complaint = await Complaint.findById(complaintId);

    if (!complaint || complaint.userId.toString() !== req.user.id) {
        res.status(404);
        throw new Error('Complaint not found or unauthorized');
    }

    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a file');
    }

    // Calculate Hash
    const hash = crypto.createHash('sha256');
    hash.update(req.file.buffer);
    const sha256Hash = hash.digest('hex');

    // Upload to Cloudinary
    const result = await cloudinaryUploadBuffer(req.file.buffer);

    const evidence = await Evidence.create({
        complaintId: complaint._id,
        userId: req.user.id,
        originalFileName: req.file.originalname,
        fileUrl: result.secure_url,
        publicId: result.public_id,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        sha256Hash: sha256Hash
    });

    res.status(201).json(evidence);
});

// @desc    Get evidence by complaint
// @route   GET /api/evidence/:complaintId
// @access  Private
const getEvidenceList = asyncHandler(async (req, res) => {
    const complaint = await Complaint.findById(req.params.complaintId);
    if (!complaint || complaint.userId.toString() !== req.user.id) {
        res.status(404);
        throw new Error('Complaint not found or unauthorized');
    }

    const evidence = await Evidence.find({ complaintId: req.params.complaintId, userId: req.user.id });
    res.status(200).json(evidence);
});

// @desc    Verify evidence integrity
// @route   POST /api/evidence/verify/:evidenceId
// @access  Private
const verifyEvidence = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a file to verify');
    }

    const evidence = await Evidence.findById(req.params.evidenceId);
    if (!evidence || evidence.userId.toString() !== req.user.id) {
        res.status(404);
        throw new Error('Evidence entry not found or unauthorized');
    }

    const hash = crypto.createHash('sha256');
    hash.update(req.file.buffer);
    const currentHash = hash.digest('hex');

    const isValid = currentHash === evidence.sha256Hash;

    res.status(200).json({
        isValid,
        currentHash,
        originalHash: evidence.sha256Hash,
        message: isValid ? 'File verification successful. Match found.' : 'Warning: File mismatch. Evidence may be altered.'
    });
});

// @desc    Delete evidence
// @route   DELETE /api/evidence/:id
// @access  Private
const deleteEvidence = asyncHandler(async (req, res) => {
    const evidence = await Evidence.findById(req.params.id);

    if (!evidence) {
        res.status(404);
        throw new Error('Evidence not found');
    }

    if (evidence.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized to delete this evidence');
    }

    // Attempt deleting from Cloudinary first
    try {
        await cloudinaryDestroy(evidence.publicId);
    } catch (err) {
        console.error('Cloudinary destroy failure (ignoring safely): ', err);
    }

    await Evidence.findByIdAndDelete(req.params.id);
    res.status(200).json({ id: req.params.id });
});


module.exports = {
    uploadEvidence,
    getEvidenceList,
    verifyEvidence,
    deleteEvidence,
};
