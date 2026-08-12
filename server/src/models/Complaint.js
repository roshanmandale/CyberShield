const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    complaintId: {
        type: String,
        required: true,
        unique: true,
    },
    crimeType: {
        type: String,
        required: true,
        enum: [
            'Online Financial Fraud',
            'UPI Fraud',
            'Phishing',
            'Social Media Scam',
            'Account Hacking',
            'Cyber Bullying',
            'Identity Theft',
            'Other'
        ]
    },
    language: {
        type: String,
        required: true,
        enum: ['English', 'Hindi', 'Marathi']
    },
    incidentDate: {
        type: Date,
        required: true,
    },
    amount: {
        type: Number,
        default: 0
    },
    originalDescription: {
        type: String,
        required: true,
    },
    generatedComplaint: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Draft', 'Saved'],
        default: 'Draft'
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Complaint', complaintSchema);
