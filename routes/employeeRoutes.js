const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  addEmployee,
  getAllEmployees,
  searchEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');

const employeeValidation = [
  body('name').trim().notEmpty().withMessage('Employee name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('performanceScore')
    .isNumeric().withMessage('Performance score must be a number')
    .isFloat({ min: 0, max: 100 }).withMessage('Performance score must be between 0 and 100'),
  body('experience')
    .isNumeric().withMessage('Experience must be a number')
    .isFloat({ min: 0 }).withMessage('Experience cannot be negative'),
];

// All routes protected
router.use(protect);

router.get('/search', searchEmployees);          // GET /api/employees/search
router.get('/', getAllEmployees);                 // GET /api/employees
router.post('/', employeeValidation, addEmployee); // POST /api/employees
router.get('/:id', getEmployee);                 // GET /api/employees/:id
router.put('/:id', updateEmployee);              // PUT /api/employees/:id
router.delete('/:id', deleteEmployee);           // DELETE /api/employees/:id

module.exports = router;
