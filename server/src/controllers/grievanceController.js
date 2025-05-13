const Grievance = require('../models/Grievance');
const { validationResult } = require('express-validator');

const grievanceController = {
    // Create new grievance
    createGrievance: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const grievance = new Grievance({
                complainant: {
                    name: req.body.name,
                    phone: req.body.phone,
                    email: req.body.email,
                    address: req.body.address
                },
                department: req.body.department,
                subject: req.body.subject,
                description: req.body.description,
                location: req.body.location,
                priority: req.body.priority || 'medium',
                attachments: req.files ? req.files.map(file => file.path) : []
            });

            await grievance.save();

            // Add initial timeline entry
            grievance.timeline.push({
                status: 'pending',
                updatedBy: req.user._id,
                comment: 'Grievance registered'
            });

            await grievance.save();

            res.status(201).json({
                success: true,
                message: 'Grievance registered successfully',
                data: grievance
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error registering grievance',
                error: error.message
            });
        }
    },

    // Get all grievances with filtering and pagination
    getGrievances: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            let query = {};

            // Apply filters if provided
            if (req.query.status) query.status = req.query.status;
            if (req.query.department) query.department = req.query.department;
            if (req.query.priority) query.priority = req.query.priority;

            // Search by ticket ID or complainant phone
            if (req.query.search) {
                query.$or = [
                    { ticketId: { $regex: req.query.search, $options: 'i' } },
                    { 'complainant.phone': { $regex: req.query.search, $options: 'i' } }
                ];
            }

            const grievances = await Grievance.find(query)
                .populate('department', 'name')
                .populate('assignedTo', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Grievance.countDocuments(query);

            res.json({
                success: true,
                data: grievances,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching grievances',
                error: error.message
            });
        }
    },

    // Get single grievance by ID
    getGrievanceById: async (req, res) => {
        try {
            const grievance = await Grievance.findById(req.params.id)
                .populate('department', 'name')
                .populate('assignedTo', 'name')
                .populate('comments.postedBy', 'name')
                .populate('timeline.updatedBy', 'name');

            if (!grievance) {
                return res.status(404).json({
                    success: false,
                    message: 'Grievance not found'
                });
            }

            res.json({
                success: true,
                data: grievance
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching grievance',
                error: error.message
            });
        }
    },

    // Update grievance status
    updateStatus: async (req, res) => {
        try {
            const { status, comment } = req.body;
            const grievance = await Grievance.findById(req.params.id);

            if (!grievance) {
                return res.status(404).json({
                    success: false,
                    message: 'Grievance not found'
                });
            }

            grievance.status = status;
            grievance.timeline.push({
                status,
                updatedBy: req.user._id,
                comment
            });

            await grievance.save();

            res.json({
                success: true,
                message: 'Status updated successfully',
                data: grievance
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating status',
                error: error.message
            });
        }
    },

    // Add comment to grievance
    addComment: async (req, res) => {
        try {
            const grievance = await Grievance.findById(req.params.id);

            if (!grievance) {
                return res.status(404).json({
                    success: false,
                    message: 'Grievance not found'
                });
            }

            grievance.comments.push({
                text: req.body.text,
                postedBy: req.user._id
            });

            await grievance.save();

            res.json({
                success: true,
                message: 'Comment added successfully',
                data: grievance
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error adding comment',
                error: error.message
            });
        }
    },

    // Assign grievance to user
    assignGrievance: async (req, res) => {
        try {
            const grievance = await Grievance.findById(req.params.id);

            if (!grievance) {
                return res.status(404).json({
                    success: false,
                    message: 'Grievance not found'
                });
            }

            grievance.assignedTo = req.body.userId;
            grievance.timeline.push({
                status: grievance.status,
                updatedBy: req.user._id,
                comment: `Assigned to ${req.body.userName}`
            });

            await grievance.save();

            res.json({
                success: true,
                message: 'Grievance assigned successfully',
                data: grievance
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error assigning grievance',
                error: error.message
            });
        }
    }
};

module.exports = grievanceController;