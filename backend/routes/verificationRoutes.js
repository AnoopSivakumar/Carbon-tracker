const express = require('express');
const { decideActivity, verificationsForActivity } = require('../controllers/verificationController');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate);

router.post('/:activityId', requireRole('employee', 'admin'), decideActivity); // Verify/Reject Activity
router.get('/:activityId', verificationsForActivity);

module.exports = router;
