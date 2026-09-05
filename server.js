require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// CockroachDB connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database and table
async function initDB() {
  const client = await pool.connect();
  try {
    // Create the reports table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS satsang_reports (
        id SERIAL PRIMARY KEY,
        satsangPlace VARCHAR(255) DEFAULT 'Kesnand',
        satsangDate VARCHAR(50),
        satsangKarta VARCHAR(255),
        pathiName VARCHAR(255),
        baniTaken VARCHAR(255),
        shabadTaken VARCHAR(255),
        shabadsStarted VARCHAR(50),
        satsangStarted VARCHAR(50),
        satsangCompleted VARCHAR(50),
        adultGents INTEGER DEFAULT 0,
        adultLadies INTEGER DEFAULT 0,
        children INTEGER DEFAULT 0,
        totalAttendance INTEGER DEFAULT 0,
        sewadarLadies INTEGER DEFAULT 0,
        sewadarGents INTEGER DEFAULT 0,
        guidesewadarBoys INTEGER DEFAULT 0,
        guidesewadarGirls INTEGER DEFAULT 0,
        totalSewadar INTEGER DEFAULT 0,
        coordSewadar VARCHAR(255),
        carCount INTEGER DEFAULT 0,
        eCarCount INTEGER DEFAULT 0,
        rickshaw INTEGER DEFAULT 0,
        eRickshaw INTEGER DEFAULT 0,
        bike INTEGER DEFAULT 0,
        ebike INTEGER DEFAULT 0,
        scooty INTEGER DEFAULT 0,
        escooty INTEGER DEFAULT 0,
        cycles INTEGER DEFAULT 0,
        bus INTEGER DEFAULT 0,
        truck INTEGER DEFAULT 0,
        tempo INTEGER DEFAULT 0,
        totalVehicle INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on satsangDate for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_satsang_date ON satsang_reports(satsangDate)
    `);

    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
  } finally {
    client.release();
  }
}

// API Routes

// Helper to convert IDs to strings in all records
function normalizeRecords(rows) {
  return rows.map(row => ({
    ...row,
    id: String(row.id)
  }));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get all reports
app.get('/api/reports', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM satsang_reports ORDER BY satsangDate DESC, id DESC'
    );
    res.json(normalizeRecords(result.rows));
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get report by ID
app.get('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Try as string first, then as number
    let result = await pool.query(
      'SELECT * FROM satsang_reports WHERE CAST(id AS TEXT) = $1',
      [id]
    );
    if (result.rows.length === 0) {
      result = await pool.query(
        'SELECT * FROM satsang_reports WHERE id = $1',
        [id]
      );
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(normalizeRecords(result.rows)[0]);
  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Get report by date
app.get('/api/reports/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const result = await pool.query(
      'SELECT * FROM satsang_reports WHERE satsangDate = $1 ORDER BY id DESC LIMIT 1',
      [date]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No report found for this date' });
    }
    res.json(normalizeRecords(result.rows)[0]);
  } catch (err) {
    console.error('Error fetching report by date:', err);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Create new report
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
    const existingCheck = await pool.query(
      'SELECT id FROM satsang_reports WHERE satsangDate = $1',
      [satsangDate]
    );

    if (existingCheck.rows.length > 0) {
      // Update existing report
      const existingId = existingCheck.rows[0].id;
      const updateResult = await pool.query(`
        UPDATE satsang_reports SET
          satsangPlace = $1, satsangKarta = $2, pathiName = $3, baniTaken = $4,
          shabadTaken = $5, shabadsStarted = $6, satsangStarted = $7, satsangCompleted = $8,
          adultGents = $9, adultLadies = $10, children = $11, totalAttendance = $12,
          sewadarLadies = $13, sewadarGents = $14, guidesewadarBoys = $15, guidesewadarGirls = $16, totalSewadar = $17,
          coordSewadar = $18, carCount = $19, eCarCount = $20, rickshaw = $21, eRickshaw = $22,
          bike = $23, ebike = $24, scooty = $25, escooty = $26, cycles = $27,
          bus = $28, truck = $29, tempo = $30, totalVehicle = $31,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $32
        RETURNING *
      `, [
        satsangPlace || 'Kesnand', satsangKarta, pathiName, baniTaken,
        shabadTaken, shabadsStarted, satsangStarted, satsangCompleted,
        adultGents || 0, adultLadies || 0, children || 0, totalAttendance || 0,
        sewadarLadies || 0, sewadarGents || 0, guidesewadarBoys || 0, guidesewadarGirls || 0, totalSewadar || 0,
        coordSewadar, carCount || 0, eCarCount || 0, rickshaw || 0, eRickshaw || 0,
        bike || 0, ebike || 0, scooty || 0, escooty || 0, cycles || 0,
        bus || 0, truck || 0, tempo || 0, totalVehicle || 0,
        existingId
      ]);
      return res.json({
        message: 'Report updated successfully',
        report: normalizeRecords(updateResult.rows)[0],
        updated: true
      });
    }

    // Insert new report
    const result = await pool.query(`
      INSERT INTO satsang_reports (
        satsangPlace, satsangDate, satsangKarta, pathiName, baniTaken,
        shabadTaken, shabadsStarted, satsangStarted, satsangCompleted,
        adultGents, adultLadies, children, totalAttendance,
        sewadarLadies, sewadarGents, guidesewadarBoys, guidesewadarGirls, totalSewadar,
        coordSewadar, carCount, eCarCount, rickshaw, eRickshaw,
        bike, ebike, scooty, escooty, cycles, bus, truck, tempo, totalVehicle
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)
      RETURNING *
    `, [
      satsangPlace || 'Kesnand', satsangDate, satsangKarta, pathiName, baniTaken,
      shabadTaken, shabadsStarted, satsangStarted, satsangCompleted,
      adultGents || 0, adultLadies || 0, children || 0, totalAttendance || 0,
      sewadarLadies || 0, sewadarGents || 0, guidesewadarBoys || 0, guidesewadarGirls || 0, totalSewadar || 0,
      coordSewadar, carCount || 0, eCarCount || 0, rickshaw || 0, eRickshaw || 0,
      bike || 0, ebike || 0, scooty || 0, escooty || 0, cycles || 0,
      bus || 0, truck || 0, tempo || 0, totalVehicle || 0
    ]);

    res.status(201).json({
      message: 'Report saved successfully',
      report: normalizeRecords(result.rows)[0],
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
    const { id } = req.params;
    const {
      satsangPlace, satsangDate, satsangKarta, pathiName, baniTaken,
      shabadTaken, shabadsStarted, satsangStarted, satsangCompleted,
      adultGents, adultLadies, children, totalAttendance,
      sewadarLadies, sewadarGents, guidesewadarBoys, guidesewadarGirls, totalSewadar,
      coordSewadar, carCount, eCarCount, rickshaw, eRickshaw,
      bike, ebike, scooty, escooty, cycles, bus, truck, tempo, totalVehicle
    } = req.body;

    const result = await pool.query(`
      UPDATE satsang_reports SET
        satsangPlace = $1, satsangDate = $2, satsangKarta = $3, pathiName = $4, baniTaken = $5,
        shabadTaken = $6, shabadsStarted = $7, satsangStarted = $8, satsangCompleted = $9,
        adultGents = $10, adultLadies = $11, children = $12, totalAttendance = $13,
        sewadarLadies = $14, sewadarGents = $15, guidesewadarBoys = $16, guidesewadarGirls = $17, totalSewadar = $18,
        coordSewadar = $19, carCount = $20, eCarCount = $21, rickshaw = $22, eRickshaw = $23,
        bike = $24, ebike = $25, scooty = $26, escooty = $27, cycles = $28,
        bus = $29, truck = $30, tempo = $31, totalVehicle = $32,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $33
      RETURNING *
    `, [
      satsangPlace, satsangDate, satsangKarta, pathiName, baniTaken,
      shabadTaken, shabadsStarted, satsangStarted, satsangCompleted,
      adultGents, adultLadies, children, totalAttendance,
      sewadarLadies, sewadarGents, guidesewadarBoys, guidesewadarGirls, totalSewadar,
      coordSewadar, carCount, eCarCount, rickshaw, eRickshaw,
      bike, ebike, scooty, escooty, cycles, bus, truck, tempo, totalVehicle,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ message: 'Report updated successfully', report: normalizeRecords(result.rows)[0] });
  } catch (err) {
    console.error('Error updating report:', err);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Delete report by ID
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM satsang_reports WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
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
    const result = await pool.query(
      'SELECT id, satsangDate, satsangKarta, totalAttendance, totalVehicle, created_at FROM satsang_reports ORDER BY satsangDate DESC, id DESC LIMIT $1',
      [limit]
    );
    res.json(normalizeRecords(result.rows));
  } catch (err) {
    console.error('Error fetching recent reports:', err);
    res.status(500).json({ error: 'Failed to fetch recent reports' });
  }
});

// Search reports by date range
app.get('/api/reports/search', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = 'SELECT * FROM satsang_reports WHERE 1=1';
    const params = [];

    if (startDate) {
      params.push(startDate);
      query += ` AND satsangDate >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      query += ` AND satsangDate <= $${params.length}`;
    }

    query += ' ORDER BY satsangDate DESC, id DESC';

    const result = await pool.query(query, params);
    res.json(normalizeRecords(result.rows));
  } catch (err) {
    console.error('Error searching reports:', err);
    res.status(500).json({ error: 'Failed to search reports' });
  }
});

// Initialize database and start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});