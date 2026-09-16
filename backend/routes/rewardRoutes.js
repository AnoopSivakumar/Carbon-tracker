const express = require('express');
const { myRewards, pendingRewards, decideReward, leaderboard } = require('../controllers/rewardController');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate);

router.get('/mine', requireRole('user'), myRewards);
router.get('/pending', requireRole('admin'), pendingRewards);
router.put('/:id/decision', requireRole('admin'), decideReward);   // Approve/Reject Reward Points
router.get('/leaderboard', leaderboard);                            // User Leaderboard Summary

module.exports = router;
