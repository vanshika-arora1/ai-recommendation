const { validationResult } = require('express-validator');
const Employee = require('../models/Employee');

// POST /api/employees
const addEmployee = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, department, skills, performanceScore, experience } = req.body;

    const exists = await Employee.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Employee with this email already exists' });
    }

    const employee = await Employee.create({ name, email, department, skills, performanceScore, experience });

    res.status(201).json({ success: true, message: 'Employee added successfully', data: employee });
  } catch (error) {
    next(error);
  }
};

// GET /api/employees
const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ performanceScore: -1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    next(error);
  }
};

// GET /api/employees/search?department=X&minScore=Y&maxScore=Z
const searchEmployees = async (req, res, next) => {
  try {
    const { department, minScore, maxScore, skills } = req.query;
    const query = {};

    if (department) query.department = { $regex: department, $options: 'i' };
    if (minScore || maxScore) {
      query.performanceScore = {};
      if (minScore) query.performanceScore.$gte = Number(minScore);
      if (maxScore) query.performanceScore.$lte = Number(maxScore);
    }
    if (skills) {
      const skillList = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillList };
    }

    const employees = await Employee.find(query).sort({ performanceScore: -1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    next(error);
  }
};

// GET /api/employees/:id
const getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// PUT /api/employees/:id
const updateEmployee = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, message: 'Employee updated successfully', data: employee });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/employees/:id
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, message: 'Employee removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { addEmployee, getAllEmployees, searchEmployees, getEmployee, updateEmployee, deleteEmployee };
