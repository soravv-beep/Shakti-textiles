/* 404 for unmatched API routes */
exports.notFound = (req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found.' });
};

/* Central error handler */
// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Payload too large.' });
  }
  if (err && err.message && err.message.includes('files are allowed')) {
    return res.status(415).json({ success: false, message: err.message });
  }
  if (err && err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate record — a similar item already exists.' });
  }
  if (err && err.name === 'ValidationError') {
    return res.status(422).json({ success: false, message: err.message });
  }
  if (err && err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Malformed identifier.' });
  }
  /* Services attach err.status (401/409/422…) with a safe, user-facing message. */
  if (err && err.status && err.message) {
    return res.status(err.status).json({ success: false, message: err.message });
  }
  console.error('[error]', err);
  res.status(500).json({ success: false, message: 'Something went wrong on our side. Please try again.' });
};
