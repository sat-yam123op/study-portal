const express = require('express');
const router = express.Router();
const { getLatestUpdates } = require('../controllers/updateController');
const { protect } = require('../middleware/auth');


// GET latest 15 updates (authenticated users only)
router.get('/', protect, getLatestUpdates);


module.exports = router;