const data = require('../services/data');
const { ENQUIRY_STATUSES } = require('../config/constants');

/* ── Enquiry inbox ─────────────────────────────────────── */

/* GET /api/admin/enquiries?status=&q= */
exports.listEnquiries = async (req, res, next) => {
  try {
    const { status, q } = req.query;
    const { enquiries, counts } = await data.adminListEnquiries({ status, q });
    res.json({ success: true, data: enquiries, counts });
  } catch (err) { next(err); }
};

/* PATCH /api/admin/enquiries/:id */
exports.updateEnquiryStatus = async (req, res, next) => {
  try {
    const status = String(req.body.status || '').toUpperCase();
    if (!ENQUIRY_STATUSES.includes(status)) {
      return res.status(422).json({ success: false, message: `Status must be one of: ${ENQUIRY_STATUSES.join(', ')}.` });
    }
    const enquiry = await data.adminUpdateEnquiry(req.params.id, { status });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    res.json({ success: true, data: enquiry });
  } catch (err) { next(err); }
};

/* DELETE /api/admin/enquiries/:id — admin deletes an enquiry manually */
exports.deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await data.adminDeleteEnquiry(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    res.json({ success: true, message: 'Enquiry deleted.' });
  } catch (err) { next(err); }
};

/* ── Products CRUD ─────────────────────────────────────── */

/* GET /api/admin/products */
exports.adminListProducts = async (req, res, next) => {
  try {
    const products = await data.adminListProducts();
    res.json({ success: true, data: products });
  } catch (err) { next(err); }
};

/* POST /api/admin/products */
exports.createProduct = async (req, res, next) => {
  try {
    const product = await data.adminCreateProduct({ ...req.body, ...(req.file ? { image: `/uploads/${req.file.filename}` } : {}) });
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
};

/* PATCH /api/admin/products/:id */
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await data.adminUpdateProduct(req.params.id, { ...req.body, ...(req.file ? { image: `/uploads/${req.file.filename}` } : {}) });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

/* DELETE /api/admin/products/:id */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await data.adminDeleteProduct(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) { next(err); }
};

/* ── Testimonials / Stats / Certificates ───────────────── */

/* GET /api/admin/testimonials */
exports.adminListTestimonials = async (req, res, next) => {
  try {
    const testimonials = await data.adminListTestimonials();
    res.json({ success: true, data: testimonials });
  } catch (err) { next(err); }
};

/* POST /api/admin/testimonials */
exports.createTestimonial = async (req, res, next) => {
  try {
    const t = await data.adminCreateTestimonial(req.body);
    res.status(201).json({ success: true, data: t });
  } catch (err) { next(err); }
};

/* DELETE /api/admin/testimonials/:id */
exports.deleteTestimonial = async (req, res, next) => {
  try {
    const t = await data.adminDeleteTestimonial(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    res.json({ success: true, message: 'Testimonial deleted.' });
  } catch (err) { next(err); }
};

/* GET /api/admin/stats */
exports.adminListStats = async (req, res, next) => {
  try {
    const stats = await data.adminListStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

/* PATCH /api/admin/stats/:key */
exports.updateStat = async (req, res, next) => {
  try {
    const stat = await data.adminUpdateStat(req.params.key, req.body);
    if (!stat) return res.status(404).json({ success: false, message: 'Stat count not found.' });
    res.json({ success: true, data: stat });
  } catch (err) { next(err); }
};

/* GET /api/admin/certificates */
exports.adminListCertificates = async (req, res, next) => {
  try {
    const certificates = await data.adminListCertificates();
    res.json({ success: true, data: certificates });
  } catch (err) { next(err); }
};

/* ── Hero slides ───────────────────────────────────── */

/* GET /api/admin/hero-slides */
exports.adminListHeroSlides = async (req, res, next) => {
  try {
    const slides = await data.adminListHeroSlides();
    res.json({ success: true, data: slides });
  } catch (err) { next(err); }
};

/* POST /api/admin/hero-slides */
exports.createHeroSlide = async (req, res, next) => {
  try {
    const slide = await data.adminCreateHeroSlide({ ...req.body, ...(req.file ? { img: `/uploads/${req.file.filename}` } : {}) });
    res.status(201).json({ success: true, data: slide });
  } catch (err) { next(err); }
};

/* PATCH /api/admin/hero-slides/:id */
exports.updateHeroSlide = async (req, res, next) => {
  try {
    const slide = await data.adminUpdateHeroSlide(req.params.id, { ...req.body, ...(req.file ? { img: `/uploads/${req.file.filename}` } : {}) });
    if (!slide) return res.status(404).json({ success: false, message: 'Slide not found.' });
    res.json({ success: true, data: slide });
  } catch (err) { next(err); }
};

/* DELETE /api/admin/hero-slides/:id */
exports.deleteHeroSlide = async (req, res, next) => {
  try {
    const slide = await data.adminDeleteHeroSlide(req.params.id);
    if (!slide) return res.status(404).json({ success: false, message: 'Slide not found.' });
    res.json({ success: true, message: 'Slide deleted.' });
  } catch (err) { next(err); }
};

/* ── Industries ───────────────────────────────────── */

/* GET /api/admin/industries */
exports.adminListIndustries = async (req, res, next) => {
  try {
    const industries = await data.adminListIndustries();
    res.json({ success: true, data: industries });
  } catch (err) { next(err); }
};

/* POST /api/admin/industries */
exports.createIndustry = async (req, res, next) => {
  try {
    const industry = await data.adminCreateIndustry(req.body);
    res.status(201).json({ success: true, data: industry });
  } catch (err) { next(err); }
};

/* PATCH /api/admin/industries/:id */
exports.updateIndustry = async (req, res, next) => {
  try {
    const industry = await data.adminUpdateIndustry(req.params.id, req.body);
    if (!industry) return res.status(404).json({ success: false, message: 'Industry not found.' });
    res.json({ success: true, data: industry });
  } catch (err) { next(err); }
};

/* DELETE /api/admin/industries/:id */
exports.deleteIndustry = async (req, res, next) => {
  try {
    const industry = await data.adminDeleteIndustry(req.params.id);
    if (!industry) return res.status(404).json({ success: false, message: 'Industry not found.' });
    res.json({ success: true, message: 'Industry deleted.' });
  } catch (err) { next(err); }
};

/* ── Admin accounts (add/remove admins, passwords) ──── */

/* GET /api/admin/accounts */
exports.adminListAccounts = async (req, res, next) => {
  try {
    const accounts = await data.adminListAccounts();
    res.json({ success: true, data: accounts });
  } catch (err) { next(err); }
};

/* POST /api/admin/accounts */
exports.createAccount = async (req, res, next) => {
  try {
    const account = await data.adminCreateAccount(req.body);
    res.status(201).json({ success: true, data: account });
  } catch (err) { next(err); }
};

/* PATCH /api/admin/accounts/me/password — change own password (current required) */
exports.changeOwnPassword = async (req, res, next) => {
  try {
    const account = await data.adminChangeOwnPassword(req.admin.id, {
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    });
    res.json({ success: true, message: 'Password updated.', data: account });
  } catch (err) { next(err); }
};

/* PATCH /api/admin/accounts/:id/password — reset a colleague's password */
exports.resetAccountPassword = async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.admin.id)) {
      return res.status(422).json({ success: false, message: 'Use “Change password” to update your own password.' });
    }
    const account = await data.adminResetPassword(req.params.id, { newPassword: req.body.newPassword });
    res.json({ success: true, message: 'Password reset.', data: account });
  } catch (err) { next(err); }
};

/* DELETE /api/admin/accounts/:id */
exports.deleteAccount = async (req, res, next) => {
  try {
    const account = await data.adminDeleteAccount(req.params.id, req.admin.id);
    res.json({ success: true, message: 'Account deleted.', data: account });
  } catch (err) { next(err); }
};

/* ── Site content (homepage blocks) ────────────────── */

/* GET /api/admin/site-content */
exports.adminListSiteContent = async (req, res, next) => {
  try {
    const rows = await data.listSiteContent();
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

/* PUT /api/admin/site-content/:key */
exports.updateSiteContent = async (req, res, next) => {
  try {
    const row = await data.adminUpdateSiteContent(req.params.key, req.body);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
};

/* PUT /api/admin/certificates/:key */
exports.upsertCertificate = async (req, res, next) => {
  try {
    const certificate = await data.adminUpsertCertificate(req.params.key, req.body);
    res.json({ success: true, data: certificate });
  } catch (err) { next(err); }
};
