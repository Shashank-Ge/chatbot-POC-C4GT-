const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        unique: true,
        required: true
    },
    complainant: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: false
        },
        address: {
            type: String,
            required: true
        }
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'rejected'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    attachments: [{
        type: String // URLs to uploaded files
    }],
    location: {
        type: String,
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    comments: [{
        text: String,
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        postedAt: {
            type: Date,
            default: Date.now
        }
    }],
    timeline: [{
        status: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        comment: String
    }]
}, {
    timestamps: true
});

// Generate unique ticket ID before saving
grievanceSchema.pre('save', async function(next) {
    if (!this.ticketId) {
        const date = new Date();
        const year = date.getFullYear();
        const count = await mongoose.model('Grievance').countDocuments();
        this.ticketId = `GRV-${year}-${(count + 1).toString().padStart(5, '0')}`;
    }
    next();
});

// Add indexes for better query performance
grievanceSchema.index({ ticketId: 1 });
grievanceSchema.index({ status: 1 });
grievanceSchema.index({ department: 1 });
grievanceSchema.index({ 'complainant.phone': 1 });

const Grievance = mongoose.model('Grievance', grievanceSchema);

module.exports = Grievance;