const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const publicController = require('../controllers/publicController');
const enquiryController = require('../controllers/enquiryController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const { validate } = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth');
const { makeUploader } = require('../middleware/upload');

const router = express.Router();

/* ── Health ────────────────────────────────────────────── */
router.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok', uptime: process.uptime() } }));

/* ── Public content endpoints ──────────────────────────── */
router.get('/products', publicController.getProducts);
router.get('/products/:slug', publicController.getProductBySlug);
router.get('/industries', publicController.getIndustries);
router.get('/stats', publicController.getStats);
router.get('/testimonials', publicController.getTestimonials);
router.get('/certificates', publicController.getCertificates);
router.get('/hero-slides', publicController.getHeroSlides);
router.get('/site-content/:key', publicController.getSiteContent);

/* ── Rate-limited public POST endpoints ────────────────── */
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please try again shortly.' },
});

router.post('/enquiry', submitLimiter, validate([
  body('name').trim().notEmpty().withMessage('Please tell us your name.'),
  body('email').trim().isEmail().withMessage('Please enter a valid business email.')
    .normalizeEmail(),
  body('product').trim().notEmpty().withMessage('Please select a product.'),
  body('quantity').trim().notEmpty().withMessage('Please enter an estimated quantity.'),
  body('phone').trim().isLength({ min: 7, max: 20 }).withMessage('Please enter a valid phone number with country code.'),
  body('message').optional().trim().isLength({ max: 2000 }).withMessage('Message is too long.'),
]), enquiryController.createEnquiry);

router.post('/contact', submitLimiter, validate([
  body('name').trim().notEmpty().withMessage('Please tell us your name.'),
  body('email').trim().isEmail().withMessage('Please enter a valid business email.'),
  body('message').trim().notEmpty().withMessage('Please write a short message.'),
]), enquiryController.createContact);

/* ── Auth ──────────────────────────────────────────────── */
router.post('/auth/login', submitLimiter, validate([
  body('email').trim().isEmail().withMessage('Enter a valid email.'),
  body('password').notEmpty().withMessage('Enter your password.'),
]), authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', requireAdmin, authController.me);

/* ── Admin (JWT protected) ─────────────────────────────── */
router.get('/admin/enquiries', requireAdmin, adminController.listEnquiries);
router.patch('/admin/enquiries/:id', requireAdmin, adminController.updateEnquiryStatus);
router.delete('/admin/enquiries/:id', requireAdmin, adminController.deleteEnquiry);

router.get('/admin/products', requireAdmin, adminController.adminListProducts);
router.post('/admin/products', requireAdmin, makeUploader().single('image'), adminController.createProduct);
router.patch('/admin/products/:id', requireAdmin, makeUploader().single('image'), adminController.updateProduct);
router.delete('/admin/products/:id', requireAdmin, adminController.deleteProduct);

router.get('/admin/testimonials', requireAdmin, adminController.adminListTestimonials);
router.post('/admin/testimonials', requireAdmin, adminController.createTestimonial);
router.delete('/admin/testimonials/:id', requireAdmin, adminController.deleteTestimonial);

router.get('/admin/stats', requireAdmin, adminController.adminListStats);
router.patch('/admin/stats/:key', requireAdmin, adminController.updateStat);

router.get('/admin/certificates', requireAdmin, adminController.adminListCertificates);
router.put('/admin/certificates/:key', requireAdmin, adminController.upsertCertificate);

router.get('/admin/hero-slides', requireAdmin, adminController.adminListHeroSlides);
router.post('/admin/hero-slides', requireAdmin, makeUploader().single('image'), adminController.createHeroSlide);
router.patch('/admin/hero-slides/:id', requireAdmin, makeUploader().single('image'), adminController.updateHeroSlide);
router.delete('/admin/hero-slides/:id', requireAdmin, adminController.deleteHeroSlide);

router.get('/admin/industries', requireAdmin, adminController.adminListIndustries);
router.post('/admin/industries', requireAdmin, adminController.createIndustry);
router.patch('/admin/industries/:id', requireAdmin, adminController.updateIndustry);
router.delete('/admin/industries/:id', requireAdmin, adminController.deleteIndustry);

router.get('/admin/site-content', requireAdmin, adminController.adminListSiteContent);
router.put('/admin/site-content/:key', requireAdmin, adminController.updateSiteContent);

/* ── Admin accounts (list / create / passwords / delete) ─ */
const passwordRules = [
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
];

router.get('/admin/accounts', requireAdmin, adminController.adminListAccounts);
router.post('/admin/accounts', requireAdmin, validate([
  body('name').trim().notEmpty().withMessage('Please enter a name.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
]), adminController.createAccount);
router.patch('/admin/accounts/me/password', requireAdmin, validate([
  body('currentPassword').notEmpty().withMessage('Enter your current password.'),
  ...passwordRules,
]), adminController.changeOwnPassword);
router.patch('/admin/accounts/:id/password', requireAdmin, validate(passwordRules), adminController.resetAccountPassword);
router.delete('/admin/accounts/:id', requireAdmin, adminController.deleteAccount);

/* Certificate PDF upload → returns { data: { url } } for linking to a cert record */
router.post('/admin/uploads/certificate', requireAdmin, makeUploader().single('file'), (req, res, next) => {
  try {
    if (!req.file) return res.status(422).json({ success: false, message: 'No file received.' });
    res.status(201).json({ success: true, data: { url: `/uploads/${req.file.filename}`, name: req.file.originalname } });
  } catch (err) { next(err); }
});

/* 404 for unknown /api/* paths */
router.use(require('../middleware/errorHandler').notFound);

module.exports = router;
