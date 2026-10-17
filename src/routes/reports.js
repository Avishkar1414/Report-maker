const express = require('express');
const controller = require('../controllers/reportsController');

const router = express.Router();

router.get('/health', controller.health);
router.get('/reports', controller.listReports);
router.get('/reports/search', controller.searchReports);
router.get('/reports/recent/:limit', controller.recentReports);
router.get('/reports/date/:date', controller.getReportByDate);
router.get('/reports/:id', controller.getReport);
router.post('/reports', controller.saveReport);
router.put('/reports/:id', controller.updateReport);
router.delete('/reports/:id', controller.deleteReport);

module.exports = router;
