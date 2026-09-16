const express = require('express');
const { listFactors, createFactor, updateFactor, deleteFactor } = require('../controllers/emissionFactorController');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate);

router.get('/', listFactors);
router.post('/', requireRole('admin'), createFactor);
router.put('/:id', requireRole('admin'), updateFactor);
router.delete('/:id', requireRole('admin'), deleteFactor);

module.exports = router;
