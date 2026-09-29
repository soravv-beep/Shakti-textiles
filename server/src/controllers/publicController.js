const data = require('../services/data');

/* GET /api/stats */
exports.getStats = async (req, res, next) => {
  try {
    const stats = await data.getStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

/* GET /api/products?industry=&category=&featured=&certification=&search= */
exports.getProducts = async (req, res, next) => {
  try {
    const products = await data.listProducts(req.query);
    res.json({ success: true, count: products.length, data: products });
  } catch (err) { next(err); }
};

/* GET /api/products/:slug */
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await data.getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

/* GET /api/industries */
exports.getIndustries = async (req, res, next) => {
  try {
    const industries = await data.listIndustries();
    res.json({ success: true, data: industries });
  } catch (err) { next(err); }
};

/* GET /api/testimonials */
exports.getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await data.listTestimonials(req.query.all === 'true');
    res.json({ success: true, data: testimonials });
  } catch (err) { next(err); }
};

/* GET /api/certificates */
exports.getCertificates = async (req, res, next) => {
  try {
    const certificates = await data.listCertificates();
    res.json({ success: true, data: certificates });
  } catch (err) { next(err); }
};

/* GET /api/hero-slides */
exports.getHeroSlides = async (req, res, next) => {
  try {
    const slides = await data.listHeroSlides();
    res.json({ success: true, data: slides });
  } catch (err) { next(err); }
};

/* GET /api/site-content/:key — welcome | process | closingCta | trustedBy */
exports.getSiteContent = async (req, res, next) => {
  try {
    const content = await data.getSiteContent(req.params.key);
    res.json({ success: true, data: content });
  } catch (err) { next(err); }
};
