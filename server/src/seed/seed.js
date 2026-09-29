/**
 * Seed script.
 * - Mongo mode: `npm run seed` upserts the admin user and all site content.
 * - Memory mode: prints the dev admin credentials created lazily on first run.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const models = require('../models');
const { PRODUCTS, INDUSTRIES, STATS, TESTIMONIALS, CERTIFICATES, HERO_SLIDES, SITE_CONTENT } = require('./seedData');

async function seedMongo() {
  const uri = process.env.MONGODB_URI && process.env.MONGODB_URI.trim();
  if (!uri) {
    console.log('MONGODB_URI not set — the server auto-seeds the in-memory store on first run.');
    console.log(`Dev admin: ${process.env.ADMIN_EMAIL || 'admin@shaktitextiles.com'} / ${process.env.ADMIN_PASSWORD || 'ChangeMe!2026'}`);
    return process.exit(0);
  }

  await mongoose.connect(uri);
  console.log('[seed] connected to MongoDB');

  // 1. Admin user (bcrypt hashed)
  const email = (process.env.ADMIN_EMAIL || 'admin@shaktitextiles.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe!2026';
  await models.Admin.findOneAndUpdate(
    { email },
    { name: process.env.ADMIN_NAME || 'Shakti Admin', email, passwordHash: await bcrypt.hash(password, 12) },
    { upsert: true },
  );
  console.log(`[seed] admin ready: ${email}`);

  // 2. Products
  for (const p of PRODUCTS) {
    await models.Product.findOneAndUpdate({ slug: p.slug }, { ...p }, { upsert: true });
  }
  console.log(`[seed] products: ${PRODUCTS.length}`);

  // 3. Industries
  for (const i of INDUSTRIES) {
    await models.Industry.findOneAndUpdate({ name: i.name }, { ...i }, { upsert: true });
  }
  console.log(`[seed] industries: ${INDUSTRIES.length}`);

  // 4. Stats
  for (const s of STATS) {
    await models.Stat.findOneAndUpdate({ key: s.key }, { ...s }, { upsert: true });
  }
  console.log(`[seed] stats: ${STATS.length}`);

  // 5. Testimonials (replace-all to keep the set curated)
  const existing = await models.Testimonial.estimatedDocumentCount();
  if (existing === 0) {
    await models.Testimonial.insertMany(TESTIMONIALS);
  }
  console.log(`[seed] testimonials: ${existing === 0 ? TESTIMONIALS.length : 'kept existing'}`);

  // 6. Certificates
  for (const c of CERTIFICATES) {
    await models.Certificate.findOneAndUpdate({ key: c.key }, { ...c }, { upsert: true });
  }
  console.log(`[seed] certificates: ${CERTIFICATES.length}`);

  // 7. Hero slides (replace-all to keep the slider curated)
  await models.HeroSlide.deleteMany({});
  await models.HeroSlide.insertMany(HERO_SLIDES);
  console.log(`[seed] hero slides: ${HERO_SLIDES.length}`);

  // 8. Site content blocks (upsert per key)
  for (const [key, block] of Object.entries(SITE_CONTENT)) {
    await models.SiteContent.findOneAndUpdate({ key }, { key, data: block }, { upsert: true, setDefaultsOnInsert: true });
  }
  console.log(`[seed] site content blocks: ${Object.keys(SITE_CONTENT).length}`);

  await mongoose.disconnect();
  console.log('[seed] done.');
  process.exit(0);
}

seedMongo().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
