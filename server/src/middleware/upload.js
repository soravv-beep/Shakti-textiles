const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..', 'uploads');

function ensureDir() {
  fs.mkdirSync(ROOT, { recursive: true });
}

/** Multer disk storage: /uploads/<kind>-<random><ext>, images and PDFs only, ≤5 MB. */
function makeUploader() {
  ensureDir();
  return require('multer')({
    storage: require('multer').diskStorage({
      destination: (_req, _file, cb) => cb(null, ROOT),
      filename: (_req, file, cb) =>
        cb(null, `${file.fieldname || 'file'}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ok = /^image\/(png|jpe?g|webp|svg\+xml)$/.test(file.mimetype) || file.mimetype === 'application/pdf';
      cb(ok ? null : new Error('Only PNG, JPG, WebP, SVG or PDF files are allowed.'), ok);
    },
  });
}

/** Serves /uploads files with a safe Content-Type; used for PDFs and images. */
function uploadsStatic(expressApp) {
  expressApp.use('/uploads', require('express').static(ROOT, {
    setHeaders(res, filePath) {
      if (filePath.endsWith('.pdf')) res.setHeader('Content-Type', 'application/pdf');
    },
  }));
}

module.exports = { makeUploader, uploadsStatic, UPLOAD_DIR: ROOT };
