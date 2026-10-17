
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reports';

function dbReady() {
    return mongoose.connection.readyState === 1;
}

function redactMongoUri(uri) {
    try {
        const parsed = new URL(uri);
        if (parsed.password) parsed.password = '***';
        return parsed.toString();
    } catch {
        return 'configured';
    }
}

mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
    .then(() => {
        console.log('✅ MongoDB connected successfully');
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
    });

// Define Report schema and model
const reportSchema = new mongoose.Schema({
  satsangPlace: { type: String, default: 'Kesnand' },
  satsangDate: { type: String, required: true },
  satsangKarta: { type: String, required: true },
  pathiName: { type: String },
  baniTaken: { type: String },
  shabadTaken: { type: String },
  shabadsStarted: { type: String },
  satsangStarted: { type: String },
  satsangCompleted: { type: String },
  adultGents: { type: Number, default: 0 },
  adultLadies: { type: Number, default: 0 },
  children: { type: Number, default: 0 },
  totalAttendance: { type: Number, default: 0 },
  sewadarLadies: { type: Number, default: 0 },
  sewadarGents: { type: Number, default: 0 },
  guidesewadarBoys: { type: Number, default: 0 },
  guidesewadarGirls: { type: Number, default: 0 },
  totalSewadar: { type: Number, default: 0 },
  coordSewadar: { type: String },
  carCount: { type: Number, default: 0 },
  eCarCount: { type: Number, default: 0 },
  rickshaw: { type: Number, default: 0 },
  eRickshaw: { type: Number, default: 0 },
  bike: { type: Number, default: 0 },
  ebike: { type: Number, default: 0 },
  scooty: { type: Number, default: 0 },
  escooty: { type: Number, default: 0 },
  cycles: { type: Number, default: 0 },
  bus: { type: Number, default: 0 },
  truck: { type: Number, default: 0 },
  tempo: { type: Number, default: 0 },
  totalVehicle: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create index on satsangDate for faster lookups
reportSchema.index({ satsangDate: 1 });

const Report = mongoose.model('Report', reportSchema);

// API Routes

// Health check — reports real database connectivity for the UI status badge
app.get('/api/health', async (req, res) => {
  try {
    if (!dbReady()) {
      return res.status(503).json({
        status: 'error',
        database: 'disconnected',
        message: 'Database is not connected'
      });
    }

    await mongoose.connection.db.admin().ping();
    return res.json({
      status: 'ok',
      database: 'connected',
      message: 'Server and database are running'
    });
  } catch (err) {
    return res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: 'Database ping failed'
    });
  }
});

// Get all reports
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ satsangDate: -1, _id: -1 });
    res.json(reports.map(report => report.toObject({ getters: true, virtuals: false })));
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get report by ID
app.get('/api/reports/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report.toObject({ getters: true, virtuals: false }));
  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Get report by date
app.get('/api/reports/date/:date', async (req, res) => {
  try {
    const report = await Report.findOne({ satsangDate: req.params.date }).sort({ _id: -1 });
    if (!report) {
      return res.status(404).json({ error: 'No report found for this date' });
    }
    res.json(report.toObject({ getters: true, virtuals: false }));
  } catch (err) {
    console.error('Error fetching report by date:', err);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Create new report (or update if date exists)
app.post('/api/reports', async (req, res) => {
  try {
    const {
      satsangPlace, satsangDate, satsangKarta, pathiName, baniTaken,
      shabadTaken, shabadsStarted, satsangStarted, satsangCompleted,
      adultGents, adultLadies, children, totalAttendance,
      sewadarLadies, sewadarGents, guidesewadarBoys, guidesewadarGirls, totalSewadar,
      coordSewadar, carCount, eCarCount, rickshaw, eRickshaw,
      bike, ebike, scooty, escooty, cycles, bus, truck, tempo, totalVehicle
    } = req.body;

    // Check if a report for this date already exists
    const existingReport = await Report.findOne({ satsangDate });

    if (existingReport) {
      // Update existing report
      const updateData = {
        satsangPlace: satsangPlace || 'Kesnand',
        satsangKarta,
        pathiName,
        baniTaken,
        shabadTaken,
        shabadsStarted,
        satsangStarted,
        satsangCompleted,
        adultGents: adultGents || 0,
        adultLadies: adultLadies || 0,
        children: children || 0,
        totalAttendance: totalAttendance || 0,
        sewadarLadies: sewadarLadies || 0,
        sewadarGents: sewadarGents || 0,
        guidesewadarBoys: guidesewadarBoys || 0,
        guidesewadarGirls: guidesewadarGirls || 0,
        totalSewadar: totalSewadar || 0,
        coordSewadar,
        carCount: carCount || 0,
        eCarCount: eCarCount || 0,
        rickshaw: rickshaw || 0,
        eRickshaw: eRickshaw || 0,
        bike: bike || 0,
        ebike: ebike || 0,
        scooty: scooty || 0,
        escooty: escooty || 0,
        cycles: cycles || 0,
        bus: bus || 0,
        truck: truck || 0,
        tempo: tempo || 0,
        totalVehicle: totalVehicle || 0,
        updatedAt: new Date()
      };

      const updatedReport = await Report.findByIdAndUpdate(
        existingReport._id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return res.json({
        message: 'Report updated successfully',
        report: updatedReport.toObject({ getters: true, virtuals: false }),
        updated: true
      });
    }

    // Insert new report
    const newReport = new Report({
      satsangPlace: satsangPlace || 'Kesnand',
      satsangDate,
      satsangKarta,
      pathiName,
      baniTaken,
      shabadTaken,
      shabadsStarted,
      satsangStarted,
      satsangCompleted,
      adultGents: adultGents || 0,
      adultLadies: adultLadies || 0,
      children: children || 0,
      totalAttendance: totalAttendance || 0,
      sewadarLadies: sewadarLadies || 0,
      sewadarGents: sewadarGents || 0,
      guidesewadarBoys: guidesewadarBoys || 0,
      guidesewadarGirls: guidesewadarGirls || 0,
      totalSewadar: totalSewadar || 0,
      coordSewadar,
      carCount: carCount || 0,
      eCarCount: eCarCount || 0,
      rickshaw: rickshaw || 0,
      eRickshaw: eRickshaw || 0,
      bike: bike || 0,
      ebike: ebike || 0,
      scooty: scooty || 0,
      escooty: escooty || 0,
      cycles: cycles || 0,
      bus: bus || 0,
      truck: truck || 0,
      tempo: tempo || 0,
      totalVehicle: totalVehicle || 0
    });

    const savedReport = await newReport.save();
    res.status(201).json({
      message: 'Report saved successfully',
      report: savedReport.toObject({ getters: true, virtuals: false }),
      updated: false
    });
  } catch (err) {
    console.error('Error saving report:', err);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

// Update report by ID
app.put('/api/reports/:id', async (req, res) => {
  try {
    const {
      satsangPlace, satsangDate, satsangKarta, pathiName, baniTaken,
      shabadTaken, shabadsStarted, satsangStarted, satsangCompleted,
      adultGents, adultLadies, children, totalAttendance,
      sewadarLadies, sewadarGents, guidesewadarBoys, guidesewadarGirls, totalSewadar,
      coordSewadar, carCount, eCarCount, rickshaw, eRickshaw,
      bike, ebike, scooty, escooty, cycles, bus, truck, tempo, totalVehicle
    } = req.body;

    const updateData = {
      satsangPlace,
      satsangDate,
      satsangKarta,
      pathiName,
      baniTaken,
      shabadTaken,
      shabadsStarted,
      satsangStarted,
      satsangCompleted,
      adultGents,
      adultLadies,
      children,
      totalAttendance,
      sewadarLadies,
      sewadarGents,
      guidesewadarBoys,
      guidesewadarGirls,
      totalSewadar,
      coordSewadar,
      carCount,
      eCarCount,
      rickshaw,
      eRickshaw,
      bike,
      ebike,
      scooty,
      escooty,
      cycles,
      bus,
      truck,
      tempo,
      totalVehicle,
      updatedAt: new Date()
    };

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedReport) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      message: 'Report updated successfully',
      report: updatedReport.toObject({ getters: true, virtuals: false })
    });
  } catch (err) {
    console.error('Error updating report:', err);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Delete report by ID
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    if (!deletedReport) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Get recent reports (for history)
app.get('/api/reports/recent/:limit', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    const reports = await Report.find()
      .sort({ satsangDate: -1, _id: -1 })
      .limit(limit)
      .select('satsangDate satsangKarta totalAttendance totalVehicle createdAt');

    res.json(reports.map(report => report.toObject({ getters: true, virtuals: false })));
  } catch (err) {
    console.error('Error fetching recent reports:', err);
    res.status(500).json({ error: 'Failed to fetch recent reports' });
  }
});

// Search reports by date range
app.get('/api/reports/search', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = {};

    if (startDate && endDate) {
      filter.satsangDate = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.satsangDate = { $gte: startDate };
    } else if (endDate) {
      filter.satsangDate = { $lte: endDate };
    }

    const reports = await Report.find(filter).sort({ satsangDate: -1, _id: -1 });
    res.json(reports.map(report => report.toObject({ getters: true, virtuals: false })));
  } catch (err) {
    console.error('Error searching reports:', err);
    res.status(500).json({ error: 'Failed to search reports' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🗄️  MongoDB target: ${redactMongoUri(MONGODB_URI)}`);
  console.log('🌐 For global access, run: npm run tunnel');
});