require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { uploadsStatic } = require('./middleware/upload');

function createApp({ store = null } = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Case-insensitive match: Render URLs are lowercase in the browser but
  // people often type capitals in CLIENT_ORIGIN (e.g. Shakti-textiles-4).
  const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  app.use('/api', cors({
    origin: (origin, cb) => (!origin || origins.includes(String(origin).toLowerCase()) ? cb(null, true)
      : cb(new Error('Not allowed by CORS'))),
    credentials: true,
  }));

  // Uploaded images / certificate PDFs
  uploadsStatic(app);

  app.use('/api', routes);

  /* Single-service deploy (Render/Railway): serve the built React client
     from client/dist when it exists. Locally without a client build the
     API keeps running on its own. */
  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
  const clientIndex = path.join(clientDist, 'index.html');
  if (fs.existsSync(clientIndex)) {
    app.use(express.static(clientDist));
    // SPA fallback — deep links like /admin or /products/:slug load the app.
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      if (req.path.startsWith('/uploads')) {
        return res.status(404).json({ success: false, message: 'File not found.' });
      }
      res.sendFile(clientIndex);
    });
  }

  app.use(errorHandler);
  return app;
}

module.exports = createApp;
