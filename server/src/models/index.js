const mongoose = require('mongoose');

const { ENQUIRY_STATUSES, PRODUCT_CATEGORIES, CERT_KEYS } = require('../config/constants');

/* ── Admin ─────────────────────────────────────────────── */
const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

/* ── Enquiry ───────────────────────────────────────────── */
const EnquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  company: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  product: { type: String, trim: true },
  quantity: { type: String, trim: true, maxlength: 60 },
  message: { type: String, trim: true, maxlength: 2000 },
  status: { type: String, enum: ENQUIRY_STATUSES, default: 'NEW', uppercase: true },
  source: { type: String, default: 'website' },
}, { timestamps: true });
EnquirySchema.index({ status: 1, createdAt: -1 });

/* ── Product ───────────────────────────────────────────── */
const SpecRowSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true }, // Title Case
  category: { type: String, enum: PRODUCT_CATEGORIES, required: true },
  image: { type: String, default: '' },
  shortDescription: { type: String, default: '', maxlength: 300 },
  description: { type: String, default: '', maxlength: 2000 },
  benefits: [{ type: String }],
  specs: [SpecRowSchema],
  industries: [{ type: String }],
  certifications: [{ type: String, enum: CERT_KEYS }],
  tags: [{ type: String }],
  minOrderQty: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });
ProductSchema.index({ category: 1, featured: -1, sortOrder: 1 });

/* ── Industry (nested) ─────────────────────────────────── */
const ApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  note: { type: String, default: '' },
}, { _id: false });

const SubIndustrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  applications: [ApplicationSchema],
}, { _id: false });

const IndustrySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, default: '' },
  description: { type: String, default: '' },
  subIndustries: [SubIndustrySchema],
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

/* ── Stat ──────────────────────────────────────────────── */
const StatSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, required: true },
  suffix: { type: String, default: '' },
  label: { type: String, required: true },
  caption: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

/* ── Testimonial ───────────────────────────────────────── */
const TestimonialSchema = new mongoose.Schema({
  quote: { type: String, required: true, maxlength: 800 },
  name: { type: String, required: true },
  role: { type: String, required: true },
  company: { type: String, required: true },
  city: { type: String, default: '' },
  featured: { type: Boolean, default: true },
}, { timestamps: true });

/* ── Certificate ───────────────────────────────────────── */
const CertificateSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
}, { timestamps: true });

/* ── Hero slide ────────────────────────────────────────── */
const HeroSlideSchema = new mongoose.Schema({
  img: { type: String, required: true },
  alt: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  line1: { type: String, default: '' },
  line2: { type: String, default: '' },
  desc: { type: String, default: '', maxlength: 600 },
  ctaLabel: { type: String, default: 'Explore' },
  ctaTo: { type: String, default: '/products' },
  secondaryLabel: { type: String, default: '' },
  secondaryTo: { type: String, default: '' },
  sortOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

/* ── Site content (editable homepage blocks) ───────────── */
const SiteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

/* ── Contact message ───────────────────────────────────── */
const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  company: { type: String, trim: true },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  handled: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = {
  Admin: mongoose.model('Admin', AdminSchema),
  Enquiry: mongoose.model('Enquiry', EnquirySchema),
  Product: mongoose.model('Product', ProductSchema),
  Industry: mongoose.model('Industry', IndustrySchema),
  Stat: mongoose.model('Stat', StatSchema),
  Testimonial: mongoose.model('Testimonial', TestimonialSchema),
  Certificate: mongoose.model('Certificate', CertificateSchema),
  HeroSlide: mongoose.model('HeroSlide', HeroSlideSchema),
  SiteContent: mongoose.model('SiteContent', SiteContentSchema),
  Contact: mongoose.model('Contact', ContactSchema),
};
