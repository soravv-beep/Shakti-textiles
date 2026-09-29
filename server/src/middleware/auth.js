const jwt = require('jsonwebtoken');
const data = require('../services/data');
const { COOKIE_NAME } = require('../config/constants');

const jwtSecret = () => process.env.JWT_SECRET || 'dev-only-secret-change-me';

/** Issues a signed admin JWT and sets it as an httpOnly cookie. */
function issueAdminCookie(res, admin) {
  const token = jwt.sign(
    { sub: String(admin._id || admin.id), email: admin.email, name: admin.name, role: 'admin' },
    jwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
  return token;
}

function clearAdminCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

/** Requires a valid admin JWT (cookie or Authorization bearer).
 *  The session only counts while the account still exists — deleting an
 *  admin revokes their cookie instantly instead of waiting out the 7-day
 *  JWT expiry. */
async function requireAdmin(req, res, next) {
  const bearer = req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies ? req.cookies[COOKIE_NAME] : null || bearer;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
  }
  try {
    const payload = jwt.verify(token, jwtSecret());
    if (payload.role !== 'admin') throw new Error('role');
    const account = await data.findAdminById(payload.sub);
    if (!account) {
      return res.status(401).json({ success: false, message: 'Session expired or invalid. Please sign in again.' });
    }
    req.admin = { id: payload.sub, email: account.email, name: account.name };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid. Please sign in again.' });
  }
}

module.exports = { issueAdminCookie, clearAdminCookie, requireAdmin };
