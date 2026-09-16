const express = require('express');
const {
  logActivity, myActivities, activityHistory, pendingActivities, getActivity
} = require('../controllers/activityController');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate);

router.post('/', requireRole('user'), logActivity);                       // Log Daily Activity
router.get('/mine', requireRole('user'), myActivities);                   // View Activity/Carbon Score Status
router.get('/history', activityHistory);                                  // Activity History
router.get('/pending', requireRole('employee', 'admin'), pendingActivities);
router.get('/:id', getActivity);

module.exports = router;
