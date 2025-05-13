const Department = require('../models/Department');
const { validationResult } = require('express-validator');

const departmentController = {
    // Create new department
    createDepartment: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, description, headOfDepartment, contactEmail, contactPhone } = req.body;

            const department = new Department({
                name,
                description,
                headOfDepartment,
                contactEmail,
                contactPhone
            });

            await department.save();

            res.status(201).json({
                success: true,
                message: 'Department created successfully',
                data: department
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating department',
                error: error.message
            });
        }
    },

    // Get all departments with optional filtering
    getAllDepartments: async (req, res) => {
        try {
            const query = {};
            
            // Add search functionality
            if (req.query.search) {
                query.name = { $regex: req.query.search, $options: 'i' };
            }

            const departments = await Department.find(query)
                .populate('headOfDepartment', 'name email')
                .sort({ name: 1 });

            res.json({
                success: true,
                data: departments
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching departments',
                error: error.message
            });
        }
    },

    // Get department by ID
    getDepartmentById: async (req, res) => {
        try {
            const department = await Department.findById(req.params.id)
                .populate('headOfDepartment', 'name email');

            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }

            res.json({
                success: true,
                data: department
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching department',
                error: error.message
            });
        }
    },

    // Update department
    updateDepartment: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, description, headOfDepartment, contactEmail, contactPhone } = req.body;

            const department = await Department.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    description,
                    headOfDepartment,
                    contactEmail,
                    contactPhone
                },
                { new: true }
            ).populate('headOfDepartment', 'name email');

            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }

            res.json({
                success: true,
                message: 'Department updated successfully',
                data: department
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating department',
                error: error.message
            });
        }
    },

    // Delete department
    deleteDepartment: async (req, res) => {
        try {
            const department = await Department.findById(req.params.id);

            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }

            // Check if department has any active grievances
            const activeGrievances = await Grievance.countDocuments({ department: req.params.id });
            if (activeGrievances > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete department with active grievances'
                });
            }

            await department.remove();

            res.json({
                success: true,
                message: 'Department deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting department',
                error: error.message
            });
        }
    },

    // Get department statistics
    getDepartmentStats: async (req, res) => {
        try {
            const departmentId = req.params.id;
            
            const stats = await Grievance.aggregate([
                { $match: { department: mongoose.Types.ObjectId(departmentId) } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const totalGrievances = await Grievance.countDocuments({ department: departmentId });
            const resolvedGrievances = await Grievance.countDocuments({
                department: departmentId,
                status: 'resolved'
            });

            res.json({
                success: true,
                data: {
                    totalGrievances,
                    resolvedGrievances,
                    resolutionRate: totalGrievances ? (resolvedGrievances / totalGrievances) * 100 : 0,
                    statusDistribution: stats
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching department statistics',
                error: error.message
            });
        }
    }
};

module.exports = departmentController;