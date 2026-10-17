const NUMBER_FIELDS = [
  'adultGents', 'adultLadies', 'children', 'totalAttendance',
  'sewadarLadies', 'sewadarGents', 'guidesewadarBoys', 'guidesewadarGirls', 'totalSewadar',
  'carCount', 'eCarCount', 'rickshaw', 'eRickshaw', 'bike', 'ebike',
  'scooty', 'escooty', 'cycles', 'bus', 'truck', 'tempo', 'totalVehicle'
];

function toText(value, fallback = '') {
  if (value == null) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function toInt(value) {
  if (value === '' || value == null) return 0;
  const number = Number.parseInt(String(value).replace(/,/g, ''), 10);
  return Number.isFinite(number) ? number : 0;
}

function buildReportFields(body = {}) {
  const satsangDate = toText(body.satsangDate);
  const satsangKarta = toText(body.satsangKarta);
  const missing = [];
  if (!satsangDate) missing.push('Satsang Date');
  if (!satsangKarta) missing.push('Satsang Karta Name');
  if (missing.length) {
    const error = new Error(`Please fill: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const fields = {
    satsangPlace: toText(body.satsangPlace, 'Kesnand'),
    satsangDate,
    satsangKarta,
    pathiName: toText(body.pathiName),
    baniTaken: toText(body.baniTaken),
    shabadTaken: toText(body.shabadTaken),
    shabadsStarted: toText(body.shabadsStarted),
    satsangStarted: toText(body.satsangStarted),
    satsangCompleted: toText(body.satsangCompleted),
    coordSewadar: toText(body.coordSewadar)
  };

  for (const field of NUMBER_FIELDS) fields[field] = toInt(body[field]);
  return fields;
}

function serializeReport(report) {
  if (!report) return null;
  const data = report.toObject({ getters: true, virtuals: true });
  // MongoDB creates _id when a new Mongoose document is instantiated. Expose
  // the same value as `id`, which the browser uses for record editing/history.
  data.id = String(report._id);
  return data;
}

function handleApiError(res, error, fallbackMessage) {
  console.error(fallbackMessage, error.message);
  const status = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({ error: error.statusCode ? error.message : fallbackMessage });
}

module.exports = { buildReportFields, handleApiError, serializeReport };
