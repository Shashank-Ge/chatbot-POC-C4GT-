const { body, param, query } = require('express-validator');

const validations = {
    // Department validations
    createDepartment: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Department name is required')
            .isLength({ min: 3, max: 100 })
            .withMessage('Department name must be between 3 and 100 characters'),
        body('description')
            .trim()
            .notEmpty()
            .withMessage('Description is required')
            .isLength({ max: 500 })
            .withMessage('Description cannot exceed 500 characters'),
        body('headOfDepartment')
            .optional()
            .isMongoId()
            .withMessage('Invalid head of department ID'),
        body('contactEmail')
            .trim()
            .notEmpty()
            .withMessage('Contact email is required')
            .isEmail()
            .withMessage('Invalid email format'),
        body('contactPhone')
            .trim()
            .notEmpty()
            .withMessage('Contact phone is required')
            .matches(/^[0-9]{10}$/)
            .withMessage('Phone number must be 10 digits')
    ],

    updateDepartment: [
        param('id')
            .isMongoId()
            .withMessage('Invalid department ID'),
        body('name')
            .optional()
            .trim()
            .isLength({ min: 3, max: 100 })
            .withMessage('Department name must be between 3 and 100 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Description cannot exceed 500 characters'),
        body('headOfDepartment')
            .optional()
            .isMongoId()
            .withMessage('Invalid head of department ID'),
        body('contactEmail')
            .optional()
            .trim()
            .isEmail()
            .withMessage('Invalid email format'),
        body('contactPhone')
            .optional()
            .trim()
            .matches(/^[0-9]{10}$/)
            .withMessage('Phone number must be 10 digits')
    ],

    // Grievance validations
    createGrievance: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Complainant name is required')
            .isLength({ min: 3, max: 100 })
            .withMessage('Name must be between 3 and 100 characters'),
        body('phone')
            .trim()
            .notEmpty()
            .withMessage('Phone number is required')
            .matches(/^[0-9]{10}$/)
            .withMessage('Phone number must be 10 digits'),
        body('email')
            .optional()
            .trim()
            .isEmail()
            .withMessage('Invalid email format'),
        body('address')
            .trim()
            .notEmpty()
            .withMessage('Address is required')
            .isLength({ max: 200 })
            .withMessage('Address cannot exceed 200 characters'),
        body('department')
            .notEmpty()
            .withMessage('Department is required')
            .isMongoId()
            .withMessage('Invalid department ID'),
        body('subject')
            .trim()
            .notEmpty()
            .withMessage('Subject is required')
            .isLength({ min: 5, max: 200 })
            .withMessage('Subject must be between 5 and 200 characters'),
        body('description')
            .trim()
            .notEmpty()
            .withMessage('Description is required')
            .isLength({ min: 20, max: 1000 })
            .withMessage('Description must be between 20 and 1000 characters'),
        body('location')
            .trim()
            .notEmpty()
            .withMessage('Location is required')
            .isLength({ max: 200 })
            .withMessage('Location cannot exceed 200 characters'),
        body('priority')
            .optional()
            .isIn(['low', 'medium', 'high', 'urgent'])
            .withMessage('Invalid priority level')
    ],

    updateGrievanceStatus: [
        param('id')
            .isMongoId()
            .withMessage('Invalid grievance ID'),
        body('status')
            .notEmpty()
            .withMessage('Status is required')
            .isIn(['pending', 'in-progress', 'resolved', 'rejected'])
            .withMessage('Invalid status'),
        body('comment')
            .trim()
            .notEmpty()
            .withMessage('Comment is required')
            .isLength({ max: 500 })
            .withMessage('Comment cannot exceed 500 characters')
    ],

    addComment: [
        param('id')
            .isMongoId()
            .withMessage('Invalid grievance ID'),
        body('text')
            .trim()
            .notEmpty()
            .withMessage('Comment text is required')
            .isLength({ max: 500 })
            .withMessage('Comment cannot exceed 500 characters')
    ],

    // Common validations
    paginationQueries: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100')
    ]
};

module.exports = validations;