const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDay, updateDay, getDaysInRange } = require('../controllers/dayController');

router.get('/', auth, getDaysInRange);
router.get('/:date', auth, getDay);
router.put('/:date', auth, updateDay);

module.exports = router;