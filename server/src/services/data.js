/**
 * Uniform data service — every controller talks only to this module.
 * Two drivers behind one API:
 *   - 'mongoose'  → MongoDB (Mongoose models)
 *   - 'memory'    → zero-config in-memory store (dev/demo fallback)
 */

const bcrypt = require('bcryptjs');

const models = require('../models');
const memory = require('../store/memory');

const MIN_PASSWORD_LEN = 8;

let driver = 'memory';
function setDriver(d) { driver = d === 'mongoose' ? 'mongoose' : 'memory'; }
function getDriver() { return driver; }

/* ── helpers ───────────────────────────────────────────── */
const byNum = (f) => (a, b) => (Number(a[f]) || 0) - (Number(b[f]) || 0);
const byCreatedDesc = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

function useMongo() { return driver === 'mongoose'; }

/* ── Public reads ──────────────────────────────────────── */

async function getStats() {
  if (useMongo()) return models.Stat.find().sort({ order: 1 }).lean();
  return memory.find('stats', null, { sort: byNum('order') });
}

async function listProducts(q = {}) {
  const filter = { active: { $ne: false } };
  if (q.industry) filter.industries = q.industry;
  if (q.category) filter.category = q.category;
  if (q.featured === 'true') filter.featured = true;
  if (q.certification) filter.certifications = q.certification;
  if (q.search) {
    const rx = new RegExp(q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { shortDescription: rx }, { category: rx }, { tags: rx }];
  }
  const exact = (v) => new RegExp(`^${String(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  if (q.industry) filter.industries = exact(q.industry);
  if (q.category) filter.category = exact(q.category);
  if (q.certification) filter.certifications = exact(q.certification);

  if (useMongo()) return models.Product.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
  return memory.find('products', filter, { sort: (a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name) });
}

async function getProductBySlug(slug) {
  if (useMongo()) return models.Product.findOne({ slug: String(slug).toLowerCase(), active: { $ne: false } }).lean();
  return memory.findOne('products', { slug: String(slug).toLowerCase(), active: { $ne: false } });
}

async function listIndustries() {
  if (useMongo()) return models.Industry.find().sort({ sortOrder: 1, name: 1 }).lean();
  return memory.find('industries', null, { sort: (a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name) });
}

async function listTestimonials(includeAll = false) {
  const filter = includeAll ? null : { featured: { $ne: false } };
  if (useMongo()) return models.Testimonial.find(filter).sort({ createdAt: 1 }).lean();
  return memory.find('testimonials', filter, { sort: (a, b) => new Date(a.createdAt) - new Date(b.createdAt) });
}

async function listCertificates() {
  if (useMongo()) return models.Certificate.find().sort({ key: 1 }).lean();
  return memory.find('certificates', null, { sort: (a, b) => a.key.localeCompare(b.key) });
}

async function listHeroSlides() {
  if (useMongo()) return models.HeroSlide.find({ active: { $ne: false } }).sort({ sortOrder: 1 }).lean();
  return memory.find('heroSlides', { active: { $ne: false } }, { sort: byNum('sortOrder') });
}

/* ── Site content (editable homepage blocks) ────────── */

async function getSiteContent(key) {
  if (useMongo()) {
    const row = await models.SiteContent.findOne({ key }).lean();
    return row ? row.data : null;
  }
  const row = await memory.findOne('siteContent', { key });
  return row ? row.data : null;
}

async function listSiteContent() {
  if (useMongo()) return models.SiteContent.find().sort({ key: 1 }).lean();
  return memory.find('siteContent', null, { sort: (a, b) => a.key.localeCompare(b.key) });
}

async function adminUpdateSiteContent(key, body) {
  let data = body && typeof body === 'object' && !Array.isArray(body) ? body : null;
  if (typeof body === 'string') {
    try { data = JSON.parse(body); } catch { data = null; }
  }
  if (!data || typeof data !== 'object') {
    const err = new Error('Content must be a JSON object.'); err.status = 422; throw err;
  }
  if (useMongo()) {
    const row = await models.SiteContent.findOneAndUpdate(
      { key }, { data }, { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();
    return row;
  }
  const existing = await memory.findOne('siteContent', { key });
  if (existing) {
    return memory.updateById('siteContent', existing._id, { data });
  }
  return memory.insert('siteContent', { key, data });
}

/* ── Public writes ─────────────────────────────────────── */

async function createEnquiry(doc) {
  if (useMongo()) return models.Enquiry.create(doc);
  return memory.insert('enquiries', { ...doc, status: 'NEW' });
}

async function createContact(doc) {
  if (useMongo()) return models.Contact.create(doc);
  return memory.insert('contacts', doc);
}

/* ── Auth ──────────────────────────────────────────────── */

async function findAdminByEmail(email) {
  const e = String(email).toLowerCase().trim();
  if (useMongo()) return models.Admin.findOne({ email: e }).lean();
  return memory.findOne('admins', { email: e });
}

async function findAdminById(id) {
  if (useMongo()) return models.Admin.findById(id).lean();
  return memory.findOne('admins', { _id: String(id) });
}

/* ── Admin: accounts (add/remove admins, password reset) ─ */

/** Never leak password hashes to the client. */
function stripHash(admin) {
  if (!admin) return null;
  const { passwordHash, ...safe } = admin;
  return safe;
}

async function adminCountAccounts() {
  return useMongo() ? models.Admin.countDocuments() : memory.count('admins');
}

async function adminListAccounts() {
  if (useMongo()) {
    const rows = await models.Admin.find().sort({ createdAt: 1 }).lean();
    return rows.map(stripHash);
  }
  const rows = await memory.find('admins', null, { sort: (a, b) => new Date(a.createdAt) - new Date(b.createdAt) });
  return rows.map(stripHash);
}

async function adminCreateAccount({ name, email, password } = {}) {
  const n = String(name || '').trim();
  const e = String(email || '').toLowerCase().trim();
  if (!n) { const err = new Error('Name is required.'); err.status = 422; throw err; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { const err = new Error('Enter a valid email address.'); err.status = 422; throw err; }
  if (!password || String(password).length < MIN_PASSWORD_LEN) {
    const err = new Error(`Password must be at least ${MIN_PASSWORD_LEN} characters.`); err.status = 422; throw err;
  }
  const dup = await findAdminByEmail(e);
  if (dup) { const err = new Error('An account with this email already exists.'); err.status = 409; throw err; }
  const passwordHash = bcrypt.hashSync(String(password), 10);
  const created = useMongo()
    ? await models.Admin.create({ name: n, email: e, passwordHash })
    : await memory.insert('admins', { name: n, email: e, passwordHash });
  return stripHash({ ...created });
}

async function adminSetPassword(id, newPassword) {
  if (!newPassword || String(newPassword).length < MIN_PASSWORD_LEN) {
    const err = new Error(`New password must be at least ${MIN_PASSWORD_LEN} characters.`); err.status = 422; throw err;
  }
  const passwordHash = await bcrypt.hash(String(newPassword), 10);
  const updated = useMongo()
    ? await models.Admin.findByIdAndUpdate(id, { passwordHash }, { new: true }).lean()
    : await memory.updateById('admins', id, { passwordHash });
  return stripHash(updated);
}

/** Signed-in admin changes their OWN password — current password required. */
async function adminChangeOwnPassword(id, { currentPassword, newPassword } = {}) {
  const admin = useMongo()
    ? await models.Admin.findById(id).lean()
    : await memory.findOne('admins', { _id: String(id) });
  if (!admin) { const err = new Error('Account not found.'); err.status = 404; throw err; }
  const ok = await bcrypt.compare(String(currentPassword || ''), admin.passwordHash);
  if (!ok) { const err = new Error('Current password is incorrect.'); err.status = 401; throw err; }
  return adminSetPassword(id, newPassword);
}

/** Any signed-in admin resets a colleague's password (no current needed). */
async function adminResetPassword(id, { newPassword } = {}) {
  const admin = useMongo()
    ? await models.Admin.findById(id).lean()
    : await memory.findOne('admins', { _id: String(id) });
  if (!admin) { const err = new Error('Account not found.'); err.status = 404; throw err; }
  return adminSetPassword(id, newPassword);
}

async function adminDeleteAccount(id, currentAdminId) {
  const target = useMongo()
    ? await models.Admin.findById(id).lean()
    : await memory.findOne('admins', { _id: String(id) });
  if (!target) { const err = new Error('Account not found.'); err.status = 404; throw err; }
  if (String(id) === String(currentAdminId)) {
    const err = new Error('You cannot delete the account you are signed in with.'); err.status = 422; throw err;
  }
  const total = await adminCountAccounts();
  if (total <= 1) { const err = new Error('You cannot delete the last admin account.'); err.status = 422; throw err; }
  const removed = useMongo()
    ? await models.Admin.findByIdAndDelete(id).lean()
    : await memory.deleteById('admins', id);
  return stripHash(removed);
}

/* ── Admin: enquiries ──────────────────────────────────── */

async function adminListEnquiries({ status, q } = {}) {
  const filter = {};
  if (status) filter.status = String(status).toUpperCase();
  if (q) {
    const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { company: rx }, { product: rx }];
  }
  const enquiryStatuses = ['NEW', 'CONTACTED', 'QUOTED', 'CLOSED'];
  const counts = {};
  for (const s of enquiryStatuses) {
    counts[s] = useMongo()
      ? await models.Enquiry.countDocuments({ status: s })
      : await memory.count('enquiries', { status: s });
  }
  const rows = useMongo()
    ? await models.Enquiry.find(filter).sort({ createdAt: -1 }).limit(500).lean()
    : await memory.find('enquiries', filter, { sort: byCreatedDesc, limit: 500 });
  return { enquiries: rows, counts };
}

async function adminUpdateEnquiry(id, { status }) {
  const s = String(status).toUpperCase();
  if (useMongo()) return models.Enquiry.findByIdAndUpdate(id, { status: s }, { new: true }).lean();
  return memory.updateById('enquiries', id, { status: s });
}

async function adminDeleteEnquiry(id) {
  if (useMongo()) return models.Enquiry.findByIdAndDelete(id).lean();
  return memory.deleteById('enquiries', id);
}

/* ── Admin: products ───────────────────────────────────── */

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function sanitizeProductBody(body) {
  const out = {};
  for (const f of ['slug', 'name', 'category', 'image', 'shortDescription', 'description', 'minOrderQty']) {
    if (body[f] !== undefined) out[f] = body[f];
  }
  for (const f of ['industries', 'certifications', 'tags', 'benefits']) {
    if (body[f] !== undefined) {
      out[f] = Array.isArray(body[f])
        ? body[f]
        : String(body[f]).split(',').map((x) => x.trim()).filter(Boolean);
    }
  }
  if (body.specs !== undefined) {
    let raw = body.specs;
    if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { raw = []; } }
    out.specs = Array.isArray(raw)
      ? raw.filter((r) => r && r.label && r.value).map((r) => ({ label: String(r.label), value: String(r.value) }))
      : [];
  }
  for (const f of ['featured', 'active']) {
    if (body[f] !== undefined) out[f] = !(body[f] === false || body[f] === 'false');
  }
  if (body.sortOrder !== undefined) out.sortOrder = Number(body.sortOrder) || 0;
  if (out.name) {
    out.name = String(out.name).trim().replace(/\b\w/g, (c) => c.toUpperCase()); // Title Case
    if (!out.slug) out.slug = slugify(out.name);
  }
  if (out.slug) out.slug = slugify(out.slug);
  return out;
}

async function adminListProducts() {
  if (useMongo()) return models.Product.find().sort({ sortOrder: 1, name: 1 }).lean();
  return memory.find('products', null, { sort: (a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name) });
}

async function adminCreateProduct(body) {
  const data = sanitizeProductBody(body);
  if (!data.name || !data.category) {
    const err = new Error('Name and category are required.'); err.status = 422; throw err;
  }
  const dup = useMongo()
    ? await models.Product.findOne({ slug: data.slug }).lean()
    : await memory.findOne('products', { slug: data.slug });
  if (dup) { const err = new Error('A product with this slug already exists.'); err.status = 409; throw err; }
  if (useMongo()) return models.Product.create(data);
  return memory.insert('products', data);
}

async function adminUpdateProduct(id, body) {
  const data = sanitizeProductBody(body);
  try {
    if (useMongo()) return await models.Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    return await memory.updateById('products', id, data);
  } catch (err) {
    if (err.code === 11000) { err.status = 409; err.message = 'A product with this slug already exists.'; }
    throw err;
  }
}

async function adminDeleteProduct(id) {
  if (useMongo()) return models.Product.findByIdAndDelete(id).lean();
  return memory.deleteById('products', id);
}

/* ── Admin: testimonials / stats / certificates ────────── */

async function adminListTestimonials() {
  if (useMongo()) return models.Testimonial.find().sort({ createdAt: -1 }).lean();
  return memory.find('testimonials', null, { sort: byCreatedDesc });
}

async function adminCreateTestimonial(body) {
  if (useMongo()) return models.Testimonial.create(body);
  return memory.insert('testimonials', { featured: true, ...body });
}

async function adminDeleteTestimonial(id) {
  if (useMongo()) return models.Testimonial.findByIdAndDelete(id).lean();
  return memory.deleteById('testimonials', id);
}

async function adminListStats() {
  if (useMongo()) return models.Stat.find().sort({ order: 1 }).lean();
  return memory.find('stats', null, { sort: byNum('order') });
}

async function adminUpdateStat(key, body) {
  const patch = {};
  for (const f of ['value', 'suffix', 'label', 'caption', 'order']) {
    if (body[f] !== undefined) patch[f] = f === 'value' || f === 'order' ? Number(body[f]) : body[f];
  }
  if (useMongo()) return models.Stat.findOneAndUpdate({ key }, patch, { new: true }).lean();
  return memory.updateWhere('stats', { key }, patch);
}

async function adminListCertificates() {
  if (useMongo()) return models.Certificate.find().sort({ key: 1 }).lean();
  return memory.find('certificates', null, { sort: (a, b) => a.key.localeCompare(b.key) });
}

/* ── Admin: hero slides ───────────────────────────── */

function sanitizeHeroBody(body) {
  const out = {};
  for (const f of ['img', 'alt', 'eyebrow', 'line1', 'line2', 'desc', 'ctaLabel', 'ctaTo', 'secondaryLabel', 'secondaryTo']) {
    if (body[f] !== undefined) out[f] = String(body[f]);
  }
  if (body.sortOrder !== undefined) out.sortOrder = Number(body.sortOrder) || 0;
  if (body.active !== undefined) out.active = !(body.active === false || body.active === 'false');
  return out;
}

async function adminListHeroSlides() {
  if (useMongo()) return models.HeroSlide.find().sort({ sortOrder: 1 }).lean();
  return memory.find('heroSlides', null, { sort: byNum('sortOrder') });
}

async function adminCreateHeroSlide(body) {
  const data = sanitizeHeroBody(body);
  if (!data.img) { const err = new Error('Slide image is required.'); err.status = 422; throw err; }
  if (useMongo()) return models.HeroSlide.create(data);
  return memory.insert('heroSlides', data);
}

async function adminUpdateHeroSlide(id, body) {
  const data = sanitizeHeroBody(body);
  if (useMongo()) return models.HeroSlide.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  return memory.updateById('heroSlides', id, data);
}

async function adminDeleteHeroSlide(id) {
  if (useMongo()) return models.HeroSlide.findByIdAndDelete(id).lean();
  return memory.deleteById('heroSlides', id);
}

/* ── Admin: industries (nested subIndustries/applications) ── */

function sanitizeIndustryBody(body) {
  const out = {};
  if (body.name !== undefined) out.name = String(body.name).trim();
  if (body.description !== undefined) out.description = String(body.description);
  if (body.sortOrder !== undefined) out.sortOrder = Number(body.sortOrder) || 0;
  if (body.subIndustries !== undefined) {
    let raw = body.subIndustries;
    if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { raw = []; } }
    out.subIndustries = Array.isArray(raw)
      ? raw.map((s) => ({
          name: String(s?.name || '').trim(),
          applications: Array.isArray(s?.applications)
            ? s.applications.map((a) => ({ name: String(a?.name || '').trim(), note: String(a?.note || '') }))
            : [],
        })).filter((s) => s.name)
      : [];
  }
  return out;
}

async function adminListIndustries() {
  if (useMongo()) return models.Industry.find().sort({ sortOrder: 1, name: 1 }).lean();
  return memory.find('industries', null, { sort: (a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name) });
}

async function adminCreateIndustry(body) {
  const data = sanitizeIndustryBody(body);
  if (!data.name) { const err = new Error('Industry name is required.'); err.status = 422; throw err; }
  const dup = useMongo()
    ? await models.Industry.findOne({ name: data.name }).lean()
    : await memory.findOne('industries', { name: data.name });
  if (dup) { const err = new Error('An industry with this name already exists.'); err.status = 409; throw err; }
  if (useMongo()) return models.Industry.create(data);
  return memory.insert('industries', data);
}

async function adminUpdateIndustry(id, body) {
  const data = sanitizeIndustryBody(body);
  if (useMongo()) return models.Industry.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  return memory.updateById('industries', id, data);
}

async function adminDeleteIndustry(id) {
  if (useMongo()) return models.Industry.findByIdAndDelete(id).lean();
  return memory.deleteById('industries', id);
}

async function adminUpsertCertificate(key, body) {
  const { name, description, fileUrl, fileName } = body;
  if (useMongo()) {
    return models.Certificate.findOneAndUpdate(
      { key }, { name, description, fileUrl, fileName },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();
  }
  return memory.updateWhere('certificates', { key }, { name, description, fileUrl, fileName });
}

/* Admin collections listing (for the dashboard sidebar counts) */
async function adminListContacts() {
  if (useMongo()) return models.Contact.find().sort({ createdAt: -1 }).limit(500).lean();
  return memory.find('contacts', null, { sort: byCreatedDesc, limit: 500 });
}

module.exports = {
  setDriver, getDriver,
  getStats, listProducts, getProductBySlug, listIndustries, listTestimonials, listCertificates, listHeroSlides, getSiteContent, listSiteContent, adminUpdateSiteContent,
  createEnquiry, createContact, findAdminByEmail, findAdminById, adminListContacts,
  adminListAccounts, adminCreateAccount, adminChangeOwnPassword, adminResetPassword, adminDeleteAccount,
  adminListEnquiries, adminUpdateEnquiry, adminDeleteEnquiry,
  adminListProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  adminListTestimonials, adminCreateTestimonial, adminDeleteTestimonial,
  adminListStats, adminUpdateStat,
  adminListCertificates, adminUpsertCertificate,
  adminListHeroSlides, adminCreateHeroSlide, adminUpdateHeroSlide, adminDeleteHeroSlide,
  adminListIndustries, adminCreateIndustry, adminUpdateIndustry, adminDeleteIndustry,
};
