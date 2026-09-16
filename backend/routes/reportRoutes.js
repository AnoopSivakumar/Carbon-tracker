const express = require('express');
const { carbonFootprintReport, monthlyImpactReport, dashboardSummary } = require('../controllers/reportController');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/summary', dashboardSummary);
router.get('/carbon-footprint', carbonFootprintReport);   // Generate Carbon Footprint Reports
router.get('/monthly-impact', monthlyImpactReport);        // Monthly Community Impact Report

module.exports = router;
