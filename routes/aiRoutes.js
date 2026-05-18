const express = require('express');
const router = express.Router();
const { recommendEmployee, rankEmployees } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/recommend', recommendEmployee);   // POST /api/ai/recommend
router.post('/rank', rankEmployees);            // POST /api/ai/rank

module.exports = router;
