require('dotenv').config();
const http = require('http');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const connectDB = require('./config/db');
const createApp = require('./app');

let memoryStore = null;
async function getStore() {
  if (!memoryStore) memoryStore = require('./store/memory');
  return memoryStore;
}

async function main() {
  const { ok, driver } = await connectDB();
  let store = null;
  if (!ok) {
    store = await getStore();
  }

  const app = createApp({ store });
  const parsedPort = Number(process.env.PORT);
  const PORT = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 5000;
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`[server] Shakti Textiles API on http://localhost:${PORT} (driver: ${driver})`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[server] Port ${PORT} pehle se kisi aur process ke paas hai (purana instance zinda hai).`);
      console.error('[server] Fix: us process ko band karo, ya server/.env mein PORT=5001 set karke dobara chalao.');
      process.exit(1);
    }
    throw err;
  });

  const shutdown = (signal) => {
    console.log(`\n[server] ${signal} received — shutting down.`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('[server] fatal:', err);
  process.exit(1);
});
