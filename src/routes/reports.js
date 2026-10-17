const express = require('express');
const controller = require('../controllers/reportsController');
const { requireGoogleSignIn } = require('../middleware/googleAuth');

const router = express.Router();

router.get('/health', controller.health);
router.get('/auth/config', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID?.trim() || null });
});
router.get('/auth/me', requireGoogleSignIn, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ email: req.user.email, name: req.user.name });
});

router.use('/reports', requireGoogleSignIn);
router.get('/reports', controller.listReports);
router.get('/reports/search', controller.searchReports);
router.get('/reports/recent/:limit', controller.recentReports);
router.get('/reports/date/:date', controller.getReportByDate);
router.get('/reports/:id', controller.getReport);
router.post('/reports', controller.saveReport);
router.put('/reports/:id', controller.updateReport);
router.delete('/reports/:id', controller.deleteReport);

module.exports = router;
