const express = require('express');
const { listCampaigns, createCampaign, updateCampaign, deleteCampaign } = require('../controllers/campaignController');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate);

router.get('/', listCampaigns);
router.post('/', requireRole('admin'), createCampaign);
router.put('/:id', requireRole('admin'), updateCampaign);
router.delete('/:id', requireRole('admin'), deleteCampaign);

module.exports = router;
