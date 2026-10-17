const app = require('./app');
const { connectDatabase, redactMongoUri } = require('./config/database');

async function startServer() {
  await connectDatabase();
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📊 API available at http://localhost:${port}/api`);
    console.log(`🗄️  MongoDB target: ${redactMongoUri()}`);
  });
  return server;
}

module.exports = { startServer };
