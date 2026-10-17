const { mongoose } = require('../config/database');
const Report = require('../models/Report');
const { buildReportFields, handleApiError, serializeReport } = require('../utils/reports');

async function health(req, res) {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'ok', database: 'connected', message: 'Server and database are running' });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected', message: 'Database is not connected' });
  }
}

async function listReports(req, res) {
  try {
    const reports = await Report.find().sort({ satsangDate: -1, _id: -1 });
    res.json(reports.map(serializeReport));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch reports');
  }
}

async function getReport(req, res) {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(serializeReport(report));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch report');
  }
}

async function getReportByDate(req, res) {
  try {
    const report = await Report.findOne({ satsangDate: req.params.date }).sort({ _id: -1 });
    if (!report) return res.status(404).json({ error: 'No report found for this date' });
    res.json(serializeReport(report));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch report');
  }
}

async function saveReport(req, res) {
  try {
    const fields = buildReportFields(req.body);
    const existing = await Report.findOne({ satsangDate: fields.satsangDate });

    if (existing) {
      Object.assign(existing, fields);
      await existing.save();
      return res.json({ message: 'Report updated successfully', report: serializeReport(existing), updated: true });
    }

    const report = new Report(fields);
    await report.save();
    return res.status(201).json({ message: 'Report saved successfully', report: serializeReport(report), updated: false });
  } catch (error) {
    handleApiError(res, error, 'Failed to save report');
  }
}

async function updateReport(req, res) {
  try {
    const fields = buildReportFields(req.body);
    const report = await Report.findByIdAndUpdate(req.params.id, fields, {
      new: true,
      runValidators: true
    });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Report updated successfully', report: serializeReport(report) });
  } catch (error) {
    handleApiError(res, error, 'Failed to update report');
  }
}

async function deleteReport(req, res) {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    handleApiError(res, error, 'Failed to delete report');
  }
}

async function recentReports(req, res) {
  try {
    const requestedLimit = Number.parseInt(req.params.limit, 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 10;
    const reports = await Report.find()
      .sort({ satsangDate: -1, _id: -1 })
      .limit(limit);
    res.json(reports.map(serializeReport));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch recent reports');
  }
}

async function searchReports(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.satsangDate = {};
      if (startDate) filter.satsangDate.$gte = startDate;
      if (endDate) filter.satsangDate.$lte = endDate;
    }
    const reports = await Report.find(filter).sort({ satsangDate: -1, _id: -1 });
    res.json(reports.map(serializeReport));
  } catch (error) {
    handleApiError(res, error, 'Failed to search reports');
  }
}

module.exports = {
  deleteReport,
  getReport,
  getReportByDate,
  health,
  listReports,
  recentReports,
  saveReport,
  searchReports,
  updateReport
};
