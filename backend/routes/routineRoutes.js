const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getRoutine, saveRoutine, applyRoutine } = require('../controllers/routineController');

router.get('/', auth, getRoutine);
router.put('/', auth, saveRoutine);
router.post('/apply', auth, applyRoutine);

module.exports = router;