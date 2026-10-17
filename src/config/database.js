const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reports';

async function connectDatabase() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ MongoDB connected successfully');
}

function redactMongoUri(uri = MONGODB_URI) {
  try {
    const parsed = new URL(uri);
    if (parsed.password) parsed.password = '***';
    return parsed.toString();
  } catch {
    return 'configured';
  }
}

module.exports = { connectDatabase, redactMongoUri, mongoose };
