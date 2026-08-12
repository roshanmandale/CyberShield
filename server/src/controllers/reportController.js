const asyncHandler = require('express-async-handler');
const PDFDocument = require('pdfkit');
const Complaint = require('../models/Complaint');
const Evidence = require('../models/Evidence');

// @desc    Generate PDF Report
// @route   GET /api/reports/:complaintId
// @access  Private
const generateReport = asyncHandler(async (req, res) => {
    const complaint = await Complaint.findById(req.params.complaintId).populate('userId', 'name email');

    if (!complaint || complaint.userId._id.toString() !== req.user.id) {
        res.status(404);
        throw new Error('Complaint not found or unauthorized');
    }

    const evidence = await Evidence.find({ complaintId: complaint._id });

    // Create a document
    const doc = new PDFDocument({ margin: 50, bufferPages: true });

    let filename = `CyberShield-${complaint.complaintId}.pdf`;
    filename = encodeURIComponent(filename);

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    function addFooter(doc) {
        const bottomPos = doc.page.height - 60;
        doc.fontSize(8).fillColor('#64748B')
            .text('CyberShield — AI-Assisted Cyber Crime Complaint Draft', 50, bottomPos, { align: 'center' })
            .text('This document is an AI-assisted cyber crime complaint DRAFT prepared for user review. It is not an officially registered FIR and does not constitute legal advice or proof of legal admissibility.', 50, bottomPos + 12, { align: 'center', width: doc.page.width - 100 });
    }

    /* ----------------------------------------------------
       PAGE 1: COMPLAINT INFORMATION
    ---------------------------------------------------- */
    doc.fillColor('#1E293B').fontSize(24).font('Helvetica-Bold').text('CyberShield', { align: 'center' });
    doc.fontSize(14).font('Helvetica').fillColor('#64748B').text('Complaint Review Manifest', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(16).fillColor('#000000').font('Helvetica-Bold').text('Complaint Information');
    doc.moveDown(1);

    doc.fontSize(12).font('Helvetica');
    const writeLine = (label, value) => {
        doc.font('Helvetica-Bold').text(`${label}: `, { continued: true }).font('Helvetica').text(value);
        doc.moveDown(0.5);
    };

    writeLine('Complaint ID', complaint.complaintId);
    writeLine('User Name', complaint.userId.name);
    writeLine('User Email', complaint.userId.email);
    writeLine('Crime Type', complaint.crimeType);
    writeLine('Language', complaint.language);
    writeLine('Incident Date', new Date(complaint.incidentDate).toLocaleDateString());
    writeLine('Amount Involved', `INR ${complaint.amount}`);
    writeLine('Creation Date', new Date(complaint.createdAt).toLocaleString());
    writeLine('Last Updated', new Date(complaint.updatedAt).toLocaleString());
    writeLine('Complaint Status', complaint.status);

    /* ----------------------------------------------------
       PAGE 2: INCIDENT INFORMATION
    ---------------------------------------------------- */
    doc.addPage();
    doc.fontSize(16).fillColor('#000000').font('Helvetica-Bold').text('Incident Information');
    doc.moveDown(1);

    doc.fontSize(12).font('Helvetica-Bold').fillColor('#334155').text('Original User Description');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('#000000').text(complaint.originalDescription, { align: 'justify' });

    doc.moveDown(2);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#334155').text('AI-Assisted Complaint Draft');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('#000000').text(complaint.generatedComplaint || 'Draft not generated yet.', { align: 'justify' });


    /* ----------------------------------------------------
       PAGE 3+: EVIDENCE MANIFEST
    ---------------------------------------------------- */
    doc.addPage();
    doc.fontSize(16).fillColor('#000000').font('Helvetica-Bold').text('Evidence Manifest');
    doc.moveDown(1);

    if (evidence.length === 0) {
        doc.fontSize(11).font('Helvetica-Oblique').fillColor('#64748B').text('No evidence attached to this complaint.');
    } else {
        evidence.forEach((ev, idx) => {
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#1E293B').text(`Evidence File #${idx + 1}`);
            doc.moveDown(0.2);
            doc.fontSize(10).font('Helvetica');
            doc.text(`Evidence ID: ${ev._id}`);
            doc.text(`Original Filename: ${ev.originalFileName}`);
            doc.text(`File Type: ${ev.fileType}`);
            doc.text(`File Size: ${(ev.fileSize / 1024).toFixed(2)} KB`);
            doc.text(`Upload Timestamp: ${new Date(ev.uploadedAt).toLocaleString()}`);
            doc.text(`SHA-256 System Hash: ${ev.sha256Hash}`);
            if (ev.publicId) doc.text(`Cloudinary Reference: ${ev.publicId}`);
            doc.moveDown(1.5);
        });
    }

    // Attach footer to all pages
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        addFooter(doc);
    }

    doc.end();
});

module.exports = {
    generateReport
};
