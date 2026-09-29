/**
 * File-backed data store used when MongoDB is not configured.
 *
 * - First run: seeds every collection from seedData.
 * - Every write is persisted to server/data/store.json, so enquiries,
 *   admin edits and content changes SURVIVE server restarts.
 * - Nothing is ever auto-deleted: enquiries live until an admin deletes them.
 * - Per-collection `initialized` tracking: collections added in later
 *   versions seed themselves without touching existing user data.
 */

const fs = require('fs');
const path = require('path');
const {
  PRODUCTS, INDUSTRIES, STATS, TESTIMONIALS, CERTIFICATES, HERO_SLIDES, SITE_CONTENT,
} = require('../seed/seedData');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const uid = () => Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
const nowIso = () => new Date().toISOString();
const withIds = (docs) => docs.map((d) => ({ ...d, _id: uid(), createdAt: nowIso(), updatedAt: nowIso() }));

const SEEDS = {
  products: () => PRODUCTS.map((p) => ({ ...p })),
  industries: () => INDUSTRIES.map((i) => ({ ...i })),
  stats: () => STATS.map((s) => ({ ...s })),
  testimonials: () => TESTIMONIALS.map((t) => ({ ...t })),
  certificates: () => CERTIFICATES.map((c) => ({ ...c })),
  heroSlides: () => HERO_SLIDES.map((h) => ({ ...h })),
  siteContent: () => Object.entries(SITE_CONTENT).map(([key, data]) => ({ key, data })),
};

const db = {
  admins: [],
  enquiries: [],
  contacts: [],
  products: [],
  industries: [],
  stats: [],
  testimonials: [],
  certificates: [],
  heroSlides: [],
  siteContent: [],
};

let initialized = [];
let loaded = false;

function persistNow() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const payload = JSON.stringify({ initialized, savedAt: nowIso(), ...db });
    const tmp = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tmp, payload);
    fs.renameSync(tmp, DATA_FILE);
  } catch (err) {
    console.error('[store] persist failed:', err.message);
  }
}

let saveTimer = null;
function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => { saveTimer = null; persistNow(); }, 250);
}

function load() {
  if (loaded) return;
  loaded = true;

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      for (const key of Object.keys(db)) {
        if (Array.isArray(raw[key])) db[key] = raw[key];
      }
      initialized = Array.isArray(raw.initialized) ? raw.initialized : Object.keys(SEEDS);
    } catch (err) {
      console.error('[store] data file unreadable — reseeding.', err.message);
    }
  }

  // Seed collections that have never been initialized (new in later versions).
  let changed = false;
  for (const [coll, make] of Object.entries(SEEDS)) {
    if (!initialized.includes(coll)) {
      db[coll] = withIds(make());
      initialized.push(coll);
      changed = true;
      console.log(`[store] seeded collection: ${coll}`);
    }
  }
  // siteContent: merge any content blocks added in later versions (existing
  // keys are never touched — admin edits are preserved).
  if (initialized.includes('siteContent')) {
    for (const [key, data] of Object.entries(SITE_CONTENT)) {
      if (!db.siteContent.some((row) => row.key === key)) {
        db.siteContent.push({ key, data, _id: uid(), createdAt: nowIso(), updatedAt: nowIso() });
        changed = true;
        console.log(`[store] merged new content block: ${key}`);
      }
    }
  }
  if (changed || !fs.existsSync(DATA_FILE)) persistNow();

  // Safety net: flush on shutdown (writeFileSync is sync → safe in 'exit').
  process.on('exit', () => { try { persistNow(); } catch { /* noop */ } });
}

function ensureAdmins() {
  if (!db.admins.length) {
    db.admins.push({
      _id: uid(),
      name: process.env.ADMIN_NAME || 'Shakti Admin',
      email: (process.env.ADMIN_EMAIL || 'admin@shaktitextiles.com').toLowerCase(),
      passwordHash: require('bcryptjs').hashSync(process.env.ADMIN_PASSWORD || 'ChangeMe!2026', 10),
      createdAt: nowIso(),
    });
    scheduleSave();
  }
}

/* Mongo-style filter matching (subset used by controllers) */
function matchValue(docValue, cond) {
  if (cond instanceof RegExp) {
    if (Array.isArray(docValue)) return docValue.some((v) => cond.test(String(v)));
    return cond.test(String(docValue ?? ''));
  }
  if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
    if ('$ne' in cond) {
      if (Array.isArray(docValue)) return !docValue.some((v) => String(v) === String(cond.$ne));
      return String(docValue ?? '') !== String(cond.$ne);
    }
    return false;
  }
  if (Array.isArray(docValue)) return docValue.some((v) => String(v).toLowerCase() === String(cond).toLowerCase());
  return String(docValue ?? '').toLowerCase() === String(cond).toLowerCase();
}

function matches(doc, filter) {
  if (!filter) return true;
  for (const [key, cond] of Object.entries(filter)) {
    if (key === '$or') {
      if (!cond.some((sub) => matches(doc, sub))) return false;
      continue;
    }
    if (key === '$and') {
      if (!cond.every((sub) => matches(doc, sub))) return false;
      continue;
    }
    if (!matchValue(doc[key], cond)) return false;
  }
  return true;
}

const Store = {
  driver: 'memory',

  find(coll, filter = null, { sort = null, limit = 0 } = {}) {
    load();
    ensureAdmins();
    let rows = db[coll].filter((d) => matches(d, filter)).map((d) => ({ ...d }));
    if (sort) rows = rows.sort(sort);
    if (limit) rows = rows.slice(0, limit);
    return Promise.resolve(rows);
  },

  async findOne(coll, filter) {
    const rows = await Store.find(coll, filter, { limit: 1 });
    return rows[0] || null;
  },

  async count(coll, filter = null) {
    const rows = await Store.find(coll, filter);
    return rows.length;
  },

  async insert(coll, doc) {
    load();
    ensureAdmins();
    const rec = { ...doc, _id: uid(), createdAt: nowIso(), updatedAt: nowIso() };
    db[coll].push(rec);
    scheduleSave();
    return { ...rec };
  },

  async updateById(coll, id, patch) {
    load();
    ensureAdmins();
    const rec = db[coll].find((d) => d._id === id);
    if (!rec) return null;
    Object.assign(rec, patch, { updatedAt: nowIso() });
    scheduleSave();
    return { ...rec };
  },

  async updateWhere(coll, filter, patch) {
    load();
    ensureAdmins();
    const rec = db[coll].find((d) => matches(d, filter));
    if (!rec) return null;
    Object.assign(rec, patch, { updatedAt: nowIso() });
    scheduleSave();
    return { ...rec };
  },

  async deleteById(coll, id) {
    load();
    ensureAdmins();
    const idx = db[coll].findIndex((d) => d._id === id);
    if (idx === -1) return null;
    const [removed] = db[coll].splice(idx, 1);
    scheduleSave();
    return { ...removed };
  },
};

module.exports = Store;
