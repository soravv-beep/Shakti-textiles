const bcrypt = require('bcryptjs');
const data = require('../services/data');
const { issueAdminCookie, clearAdminCookie } = require('../middleware/auth');

/* POST /api/auth/login */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await data.findAdminByEmail(email);
    // Generic message — never reveal whether the email exists.
    if (!admin) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    issueAdminCookie(res, admin);
    res.json({ success: true, message: 'Signed in.', data: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) { next(err); }
};

/* POST /api/auth/logout */
exports.logout = async (req, res) => {
  clearAdminCookie(res);
  res.json({ success: true, message: 'Signed out.' });
};

/* GET /api/auth/me */
exports.me = async (req, res) => {
  res.json({ success: true, data: req.admin });
};
