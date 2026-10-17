const { mongoose } = require('../config/database');

const reportSchema = new mongoose.Schema({
  satsangPlace: { type: String, default: 'Kesnand' },
  satsangDate: { type: String, required: true },
  satsangKarta: { type: String, required: true },
  pathiName: { type: String, default: '' },
  baniTaken: { type: String, default: '' },
  shabadTaken: { type: String, default: '' },
  shabadsStarted: { type: String, default: '' },
  satsangStarted: { type: String, default: '' },
  satsangCompleted: { type: String, default: '' },
  adultGents: { type: Number, default: 0 },
  adultLadies: { type: Number, default: 0 },
  children: { type: Number, default: 0 },
  totalAttendance: { type: Number, default: 0 },
  sewadarLadies: { type: Number, default: 0 },
  sewadarGents: { type: Number, default: 0 },
  guidesewadarBoys: { type: Number, default: 0 },
  guidesewadarGirls: { type: Number, default: 0 },
  totalSewadar: { type: Number, default: 0 },
  coordSewadar: { type: String, default: '' },
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
  totalVehicle: { type: Number, default: 0 }
}, { timestamps: true });

reportSchema.index({ satsangDate: 1 });

module.exports = mongoose.models.Report || mongoose.model('Report', reportSchema);
