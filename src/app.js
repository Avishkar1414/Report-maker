const express = require('express');
const cors = require('cors');
const path = require('path');
const reportsRouter = require('./routes/reports');

const app = express();

app.set('trust proxy', true);
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/api', reportsRouter);
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', (req, res) => res.status(404).json({ error: 'API endpoint not found' }));

module.exports = app;
