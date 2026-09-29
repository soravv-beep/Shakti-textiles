/**
 * Central business constants shared by models, validation and seed data.
 */

const ENQUIRY_STATUSES = ['NEW', 'CONTACTED', 'QUOTED', 'CLOSED'];

const PRODUCT_CATEGORIES = [
  'Bathmat',
  'Pillow',
  'Pouf',
  'Rug And Carpets',
  'Throw',
];

const CERT_KEYS = [
  'OEKO-TEX',
  'GRS',
  'GOTS',
  'ISO 9001',
  'SEDEX',
  'REACH',
];

module.exports = {
  ENQUIRY_STATUSES,
  PRODUCT_CATEGORIES,
  CERT_KEYS,
  COOKIE_NAME: 'st_admin_token',
  PAGE_SIZES: { enquiries: 500 },
};
