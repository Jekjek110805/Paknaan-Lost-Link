import express from 'express';
import cors from 'cors';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IS_VERCEL = process.env.VERCEL === '1';
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'paknaan-secret-key-change-in-production';

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const DATABASE_PATH = process.env.DATABASE_PATH || './database.sqlite';
const isLocalPostgresUrl = DATABASE_URL ? /@(localhost|127\.0\.0\.1|\[?::1\]?)(:\d+)?\//i.test(DATABASE_URL) : false;
const USE_POSTGRES = Boolean(DATABASE_URL && (IS_VERCEL || !isLocalPostgresUrl));
const SCHEMA_VERSION = '2026-05-02-02';
const DEMO_ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || 'admin123';
const DEMO_OFFICIAL_PASSWORD = process.env.DEMO_OFFICIAL_PASSWORD || 'official123';

let pool: any = null;
let db: any = null;

if (USE_POSTGRES) {
  pool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: IS_VERCEL ? { rejectUnauthorized: false } : false
  });
} else {
  if (DATABASE_URL && isLocalPostgresUrl) {
    console.warn('\x1b[33m%s\x1b[0m', `Local Postgres is not required for development. Using SQLite at ${DATABASE_PATH}.`);
  } else {
    console.warn('\x1b[33m%s\x1b[0m', `DATABASE_URL is missing. Using SQLite at ${DATABASE_PATH}.`);
  }
}

const getAppUrl = () => {
  let url = process.env.APP_URL?.trim();
  if (!url || url.startsWith('MY_') || url === '') {
    url = `http://localhost:${PORT}`;
  }
  return url.replace(/\/+$/, '');
};
const geminiApiKey = process.env.GEMINI_API_KEY;

// File upload configuration
// Vercel filesystem is read-only. Use memoryStorage for serverless.
const storage = IS_VERCEL 
  ? multer.memoryStorage() 
  : multer.diskStorage({
      destination: './uploads/',
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      }
    });

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

// Categories
const CATEGORIES = [
  'Electronics (Phone, Laptop, Tablet)',
  'Wallet / Money',
  'ID / Documents',
  'Keys',
  'Jewelry',
  'Clothing',
  'Footwear',
  'Bag / Backpack',
  'Vehicle (Bike, Motorcycle parts)',
  'Pet (Collar, Tag)',
  'Tools',
  'Others'
];

const ZONES = [
  'Agbate',
  'Ahos',
  'Batong',
  'Camanse',
  'Camote',
  'Carrots',
  'Gabi',
  'Kalbasa',
  'Kamunggay',
  'Larya',
  'Monggos',
  'Okra',
  'Paliy',
  'Patatas',
  'Petchay',
  'Repolyo',
  'Sayote',
  'Sibuyas',
  'Sikwa',
  'Sili',
  'Talong',
  'Tamatis',
  'Tanglong',
  'Ubi',
  'Outside Barangay Paknaan',
];

const app = express();
app.use(cors());
app.use(express.json());

// Only serve static uploads when not on Vercel
if (!IS_VERCEL) {
  app.use('/uploads', express.static('./uploads'));
}

const toPgSql = (sql: string) => {
  let count = 0;
  return sql.replace(/\?/g, () => `$${++count}`);
};

const toSqliteSchema = (sql: string) => sql
  .replace(/\bSERIAL\s+PRIMARY\s+KEY\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
  .replace(/\bBOOLEAN\b/gi, 'INTEGER')
  .replace(/CURRENT_TIMESTAMP\s+\+\s+interval\s+'7 days'/gi, "datetime('now', '+7 days')");

const toSqliteRuntimeSql = (sql: string) => sql
  .replace(/CURRENT_TIMESTAMP\s+\+\s+interval\s+'7 days'/gi, "datetime('now', '+7 days')")
  .replace(/TO_CHAR\(created_at,\s*'Mon DD'\)/gi, "strftime('%m-%d', created_at)")
  .replace(/CURRENT_DATE\s+-\s+INTERVAL\s+'7 days'/gi, "datetime('now', '-7 days')")
  .replace(/date_trunc\('day',\s*created_at\)/gi, 'date(created_at)');

const optionalValue = (value: any) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
};

function createPostgresDb() {
  return {
    type: 'postgres',
    get: async (sql: string, params: any[] = []) => {
      const res = await pool.query(toPgSql(sql), params);
      return res.rows[0];
    },
    all: async (sql: string, params: any[] = []) => {
      const res = await pool.query(toPgSql(sql), params);
      return res.rows;
    },
    run: async (sql: string, params: any[] = []) => {
      const pgSql = toPgSql(sql);
      const normalizedSql = pgSql.trim().toLowerCase();
      const querySql = normalizedSql.startsWith('insert')
        && !normalizedSql.includes(' returning ')
        && !normalizedSql.startsWith('insert into app_metadata')
        ? `${pgSql} RETURNING id`
        : pgSql;
      const res = await pool.query(querySql, params);
      return { lastID: res.rows[0]?.id };
    },
    exec: async (sql: string) => {
      await pool.query(sql);
    }
  };
}

function createSqliteDb(sqliteDb: any) {
  return {
    type: 'sqlite',
    get: (sql: string, params: any[] = []) => sqliteDb.get(toSqliteRuntimeSql(sql), params),
    all: (sql: string, params: any[] = []) => sqliteDb.all(toSqliteRuntimeSql(sql), params),
    run: (sql: string, params: any[] = []) => sqliteDb.run(toSqliteRuntimeSql(sql), params),
    exec: (sql: string) => sqliteDb.exec(toSqliteSchema(sql)),
  };
}

async function ensureColumn(table: string, column: string, definition: string) {
  if (db.type === 'postgres') {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${definition}`);
    return;
  }

  const columns = await db.all(`PRAGMA table_info(${table})`);
  if (columns.some((existing: any) => existing.name === column)) return;

  const sqliteDefinition = definition
    .replace(/\bBOOLEAN\b/gi, 'INTEGER')
    .replace(/\s+DEFAULT\s+CURRENT_TIMESTAMP/gi, '');
  await db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${sqliteDefinition}`);
}

async function initDb() {
  if (USE_POSTGRES) {
    db = createPostgresDb();
  } else {
    const { open } = await import('sqlite');
    const sqlite3 = (await import('sqlite3')).default;
    db = createSqliteDb(await open({ filename: DATABASE_PATH, driver: sqlite3.Database }));
  }

  if (!IS_VERCEL) {
    const fs = await import('fs');
    if (!fs.existsSync('./uploads')) {
      try {
        fs.mkdirSync('./uploads');
      } catch (e) {
        console.warn('Could not create uploads directory:', e);
      }
    }
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const schemaVersion = await db.get('SELECT value FROM app_metadata WHERE key = ?', ['schema_version']);
  if (schemaVersion?.value === SCHEMA_VERSION) {
    return;
  }

  // Create all tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      facebook_url TEXT,
      password TEXT,
      role TEXT DEFAULT 'resident',
      provider TEXT DEFAULT 'local',
      photo_url TEXT,
      contact_number TEXT,
      address TEXT,
      purok TEXT,
      verified_at TIMESTAMP,
      email_verified BOOLEAN DEFAULT FALSE,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT CHECK(type IN ('lost', 'found')) NOT NULL,
      category TEXT,
      location TEXT,
      purok TEXT,
      date_lost DATE,
      date_found DATE,
      date_reported TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      image_url TEXT,
      facebook_url TEXT,
      status TEXT DEFAULT 'pending',
      user_id INTEGER,
      contact_preference TEXT DEFAULT 'message',
      additional_contact TEXT,
      finder_name TEXT,
      finder_contact TEXT,
      turnover_to_barangay BOOLEAN DEFAULT FALSE,
      barangay_received_by TEXT,
      storage_location TEXT,
      admin_remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS claims (
      id SERIAL PRIMARY KEY,
      item_id INTEGER,
      user_id INTEGER,
      message TEXT,
      proof_type TEXT,
      proof_url TEXT,
      facebook_url TEXT,
      id_card_url TEXT,
      status TEXT DEFAULT 'pending',
      reviewed_by INTEGER,
      reviewed_at TIMESTAMP,
      remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(item_id) REFERENCES items(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      reference_id INTEGER,
      reference_type TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      email_sent BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id INTEGER,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS ai_matches (
      id SERIAL PRIMARY KEY,
      lost_item_id INTEGER,
      found_item_id INTEGER,
      confidence_score INTEGER,
      status TEXT DEFAULT 'pending',
      confirmed_by INTEGER,
      confirmed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(lost_item_id) REFERENCES items(id),
      FOREIGN KEY(found_item_id) REFERENCES items(id)
    );

    CREATE TABLE IF NOT EXISTS qr_claim_slips (
      id SERIAL PRIMARY KEY,
      claim_id INTEGER UNIQUE,
      token TEXT NOT NULL,
      qr_data TEXT NOT NULL,
      generated_by INTEGER,
      generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP,
      used_by INTEGER,
      FOREIGN KEY(claim_id) REFERENCES claims(id),
      FOREIGN KEY(generated_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS badges (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_badges (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      badge_id INTEGER,
      awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(badge_id) REFERENCES badges(id),
      UNIQUE(user_id, badge_id)
    );

    CREATE TABLE IF NOT EXISTS suspicious_flags (
      id SERIAL PRIMARY KEY,
      claim_id INTEGER,
      user_id INTEGER,
      reason TEXT NOT NULL,
      risk_score INTEGER,
      reviewed BOOLEAN DEFAULT FALSE,
      reviewed_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(claim_id) REFERENCES claims(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

  `);

  // CREATE TABLE IF NOT EXISTS does not add columns to databases created by
  // older app versions, so keep these migrations idempotent.
  await ensureColumn('users', 'facebook_url', 'TEXT');
  await ensureColumn('users', 'contact_number', 'TEXT');
  await ensureColumn('users', 'address', 'TEXT');
  await ensureColumn('users', 'purok', 'TEXT');
  await ensureColumn('users', 'verified_at', 'TIMESTAMP');
  await ensureColumn('users', 'email_verified', 'BOOLEAN DEFAULT FALSE');
  await ensureColumn('users', 'status', "TEXT DEFAULT 'active'");
  await ensureColumn('users', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

  await ensureColumn('items', 'purok', 'TEXT');
  await ensureColumn('items', 'date_lost', 'DATE');
  await ensureColumn('items', 'date_found', 'DATE');
  await ensureColumn('items', 'date_reported', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  await ensureColumn('items', 'facebook_url', 'TEXT');
  await ensureColumn('items', 'contact_preference', "TEXT DEFAULT 'message'");
  await ensureColumn('items', 'additional_contact', 'TEXT');
  await ensureColumn('items', 'finder_name', 'TEXT');
  await ensureColumn('items', 'finder_contact', 'TEXT');
  await ensureColumn('items', 'turnover_to_barangay', 'BOOLEAN DEFAULT FALSE');
  await ensureColumn('items', 'barangay_received_by', 'TEXT');
  await ensureColumn('items', 'storage_location', 'TEXT');
  await ensureColumn('items', 'admin_remarks', 'TEXT');
  await ensureColumn('items', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

  await ensureColumn('claims', 'message', 'TEXT');
  await ensureColumn('claims', 'proof_type', 'TEXT');
  await ensureColumn('claims', 'proof_url', 'TEXT');
  await ensureColumn('claims', 'facebook_url', 'TEXT');
  await ensureColumn('claims', 'id_card_url', 'TEXT');
  await ensureColumn('claims', 'reviewed_by', 'INTEGER');
  await ensureColumn('claims', 'reviewed_at', 'TIMESTAMP');
  await ensureColumn('claims', 'remarks', 'TEXT');
  await ensureColumn('claims', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

  await ensureColumn('notifications', 'reference_id', 'INTEGER');
  await ensureColumn('notifications', 'reference_type', 'TEXT');
  await ensureColumn('notifications', 'is_read', 'BOOLEAN DEFAULT FALSE');
  await ensureColumn('notifications', 'email_sent', 'BOOLEAN DEFAULT FALSE');

  await ensureColumn('ai_matches', 'status', "TEXT DEFAULT 'pending'");
  await ensureColumn('ai_matches', 'confirmed_by', 'INTEGER');
  await ensureColumn('ai_matches', 'confirmed_at', 'TIMESTAMP');

  // Seed demo accounts. Keep these deterministic for capstone/demo deployments
  // so serverless databases can recover from stale or missing password hashes.
  const demoAdminEmail = 'admin@paknaan.gov'.toLowerCase();
  const adminExists = await db.all('SELECT * FROM users WHERE email = ?', [demoAdminEmail]);
  const adminHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 10);
  
  if (adminExists.length === 0) {
    await db.run(`
      INSERT INTO users (name, email, password, role, provider, email_verified, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['System Admin', demoAdminEmail, adminHash, 'admin', 'local', true, 'active']);
    console.log(`Demo Admin account created: ${demoAdminEmail}`);
  } else {
    await db.run(`
      UPDATE users
      SET password = ?, role = ?, provider = ?, email_verified = ?, status = ?
      WHERE email = ?
    `, [adminHash, 'admin', 'local', true, 'active', demoAdminEmail]);
  }

  // Seed Demo Official Account
  const demoOfficialEmail = 'official@paknaan.gov'.toLowerCase();
  const officialExists = await db.all('SELECT * FROM users WHERE email = ?', [demoOfficialEmail]);
  const officialHash = await bcrypt.hash(DEMO_OFFICIAL_PASSWORD, 10);
  
  if (officialExists.length === 0) {
    console.log('Seeding demo official account...');
    await db.run(`
      INSERT INTO users (name, email, password, role, provider, email_verified, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['Paknaan Official', demoOfficialEmail, officialHash, 'official', 'local', true, 'active']);
    console.log(`Demo Official account created: ${demoOfficialEmail}`);
  } else {
    await db.run(`
      UPDATE users
      SET password = ?, role = ?, provider = ?, email_verified = ?, status = ?
      WHERE email = ?
    `, [officialHash, 'official', 'local', true, 'active', demoOfficialEmail]);
  }

  // Insert default badges if not exist
  const existingBadges = await db.all('SELECT * FROM badges');
  if (existingBadges.length === 0) {
    await db.exec(`
      INSERT INTO badges (name, slug, description, icon) VALUES
      ('Honest Finder', 'honest-finder', 'Report 3 or more found items', 'handshake'),
      ('Verified Resident', 'verified-resident', 'Complete profile and verify identity', 'check'),
      ('Active Helper', 'active-helper', 'Help return 5 or more items', 'users'),
      ('Community Reporter', 'community-reporter', 'Post 10 or more items', 'megaphone'),
      ('First Claim Success', 'first-claim-success', 'First claim approved', 'target'),
      ('Long-term Member', 'long-term-member', 'Account active for over 6 months', 'star');
    `);
  }

  await db.run(`
    INSERT INTO app_metadata (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
  `, ['schema_version', SCHEMA_VERSION]);
}

let dbInitialized = false;
let dbInitError: unknown = null;
let dbInitPromise: Promise<void> = Promise.resolve();
dbInitPromise = initDb().then(() => {
  dbInitialized = true;
  console.log(`Database initialized successfully (${USE_POSTGRES ? 'Postgres' : 'SQLite'})`);
}).catch(err => {
  dbInitError = err;
  dbInitialized = true;
  console.error('Database initialization failed:', err);
});

async function startServer() {
  app.use(async (req, res, next) => {
    if (req.path === '/api/constants' || req.path === '/api/upload/image') return next();
    if (!dbInitialized) await dbInitPromise;
    if (dbInitError && req.path.startsWith('/api') && req.path !== '/api/constants') {
      const detail = dbInitError instanceof Error ? dbInitError.message : String(dbInitError);
      return res.status(503).json({
        error: 'Database unavailable',
        details: detail || 'Check DATABASE_URL and make sure the database server is running.'
      });
    }
    next();
  });

  // ==================== MIDDLEWARE ====================
  
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Invalid or expired token' });
      req.user = user;
      next();
    });
  };

  const verifyRole = (allowedRoles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      }
      next();
    };
  };

  const logActivity = async (userId: number, action: string, targetType?: string, targetId?: number, details?: string) => {
    try {
      await db.run(
        'INSERT INTO activity_logs (user_id, action, target_type, target_id, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, action, targetType, targetId, details, null, null]
      );
    } catch (e) {
      console.error('Failed to log activity:', e);
    }
  };

  const sanitizeReturnTo = (returnTo?: unknown) => {
    if (typeof returnTo !== 'string') return '/dashboard';
    if (!returnTo.startsWith('/') || returnTo.startsWith('//') || returnTo.startsWith('/api')) return '/dashboard';
    return returnTo;
  };

  const getPublicUser = (user: any) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    photo_url: user.photo_url,
    zone: user.purok,
    facebook_url: user.facebook_url,
    provider: user.provider,
    email_verified: Boolean(user.email_verified),
    verified: user.verified_at ? true : false,
  });

  // ==================== AUTH ROUTES ====================

  app.post('/api/auth/register', async (req, res) => {
    let { name, email, password, contact_number, zone, facebook_url } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    email = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const result = await db.run(
        'INSERT INTO users (name, email, password, contact_number, purok, facebook_url) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, contact_number, zone, facebook_url]
      );
      const token = jwt.sign({ id: result.lastID, role: 'resident', name }, JWT_SECRET);
      res.status(201).json({ 
        message: 'Registration successful',
        token, 
        user: { id: result.lastID, name, email, role: 'resident' } 
      });
    } catch (e: any) {
      res.status(400).json({ error: e.message?.includes('UNIQUE') ? 'Email already exists' : 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    let { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    email = email.trim().toLowerCase();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
    await logActivity(user.id, 'login');
    res.json({ 
      token, 
      user: getPublicUser(user)
    });
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    const user = await db.get('SELECT id, name, email, role, photo_url, contact_number, address, purok, verified_at, email_verified, status, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { purok: storedZone, ...publicUser } = user;
    res.json({ 
      ...publicUser,
      zone: storedZone,
      verified: user.verified_at ? true : false
    });
  });

  app.put('/api/auth/profile', authenticateToken, async (req: any, res) => {
    const { name, contact_number, address, zone, purok, photo_url } = req.body;
    const userZone = zone || purok;
    await db.run(
      'UPDATE users SET name = ?, contact_number = ?, address = ?, purok = ?, photo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, contact_number, address, userZone, photo_url, req.user.id]
    );
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Profile updated', user: getPublicUser(user) });
  });

  // ==================== ITEM ROUTES ====================

  app.get('/api/items', async (req, res) => {
    const { type, status, category, zone, purok, search, page = 1, limit = 12 } = req.query;
    const zoneFilter = zone || purok;
    let query = 'SELECT items.*, items.purok as zone, users.name as reporter_name FROM items LEFT JOIN users ON items.user_id = users.id WHERE 1=1';
    const params: any[] = [];
    const countFilters: string[] = [];
    const countParams: any[] = [];
    
    if (type) { query += ' AND items.type = ?'; params.push(type); countFilters.push('items.type = ?'); countParams.push(type); }
    if (status && status !== 'all') { 
      query += ' AND items.status = ?'; params.push(status); countFilters.push('items.status = ?'); countParams.push(status); 
    } else if (!status) {
      query += " AND items.status NOT IN ('rejected', 'archived')"; countFilters.push("items.status NOT IN ('rejected', 'archived')"); 
    }
    if (category) { query += ' AND items.category = ?'; params.push(category); countFilters.push('items.category = ?'); countParams.push(category); }
    if (zoneFilter) { query += ' AND items.purok = ?'; params.push(zoneFilter); countFilters.push('items.purok = ?'); countParams.push(zoneFilter); }
    if (search) { 
      query += ' AND (items.title LIKE ? OR items.description LIKE ? OR items.location LIKE ?)';
      countFilters.push('(items.title LIKE ? OR items.description LIKE ? OR items.location LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
      countParams.push(s, s, s);
    }
    
    query += ' ORDER BY items.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));
    
    const items = await db.all(query, params);
    const countQuery = `SELECT COUNT(*) as total FROM items WHERE ${countFilters.length ? countFilters.join(' AND ') : '1=1'}`;
    const countResult = await db.get(countQuery, countParams);
    
    res.json({ items, total: countResult?.total || 0, page: Number(page), totalPages: Math.ceil((countResult?.total || 0) / Number(limit)) });
  });

  app.get('/api/items/:id', async (req, res) => {
    const item = await db.get(`
      SELECT items.*, items.purok as zone, users.name as reporter_name, users.purok as reporter_zone
      FROM items LEFT JOIN users ON items.user_id = users.id 
      WHERE items.id = ?
    `, [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  });

  app.post('/api/items', authenticateToken, upload.single('image'), async (req: any, res) => {
    const { 
      title, description, type, category, location, purok, zone,
      date_lost, date_found, contact_preference, additional_contact,
      finder_name, finder_contact, turnover_to_barangay, storage_location,
      image_url, facebook_url
    } = req.body;
    const itemZone = zone || purok || 'Outside Barangay Paknaan';
    const uploadedImageUrl = req.file
      ? (IS_VERCEL
          ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
          : `/uploads/${req.file.filename}`)
      : image_url;
    const willTurnOver = turnover_to_barangay === true || turnover_to_barangay === 'true' || turnover_to_barangay === '1';
    
    if (!title || !description || !type || !category || !location || !itemZone ) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    const result = await db.run(`
      INSERT INTO items (title, description, type, category, location, purok, date_lost, date_found, 
        contact_preference, additional_contact, finder_name, finder_contact, turnover_to_barangay, 
        storage_location, image_url, facebook_url, user_id, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [title, description, type, category, location, itemZone, optionalValue(date_lost), optionalValue(date_found), 
      contact_preference || 'message', optionalValue(additional_contact), optionalValue(finder_name), optionalValue(finder_contact), 
      willTurnOver, optionalValue(storage_location), optionalValue(uploadedImageUrl), optionalValue(facebook_url), req.user.id]);

    await logActivity(req.user.id, 'create_item', 'item', result.lastID, `Created ${type} item: ${title}`);
    res.status(201).json({ message: 'Item reported successfully', id: result.lastID });
  });

  app.put('/api/items/:id', authenticateToken, async (req: any, res) => {
    const item = await db.get('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this item' });
    }
    if (item.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot edit item after approval' });
    }

    const { title, description, category, location, purok, zone, date_lost, date_found } = req.body;
    const itemZone = zone || purok;
    await db.run(`
      UPDATE items SET title = ?, description = ?, category = ?, location = ?, purok = ?, 
      date_lost = ?, date_found = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `, [title, description, category, location, itemZone, optionalValue(date_lost), optionalValue(date_found), req.params.id]);
    
    res.json({ message: 'Item updated successfully' });
  });

  app.put('/api/items/:id/status', authenticateToken, verifyRole(['admin', 'official']), async (req: any, res) => {
    const { status, admin_remarks } = req.body;
    const validStatuses = ['pending', 'approved', 'posted', 'matched', 'claimed', 'returned', 'rejected', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const item = await db.get('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const parsedId = parseInt(req.params.id);
    await db.run('UPDATE items SET status = ?, admin_remarks = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
      [status, admin_remarks, parsedId]);
    
    await logActivity(req.user.id, 'update_status', 'item', parsedId, `Status changed to ${status}`);

    // Notify user
    await db.run(`
      INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type) 
      VALUES (?, ?, ?, ?, ?, 'item')
    `, [item.user_id, `item_${status}`, `Item ${status}`, `Your ${item.type} item "${item.title}" has been ${status}`, parsedId]);

    // Trigger AI matching if posted
    if (status === 'posted') {
      triggerAIMatching(parsedId, item.type).catch(console.error);
    }

    res.json({ message: 'Status updated successfully' });
  });

  app.delete('/api/items/:id', authenticateToken, async (req: any, res) => {
    const item = await db.get('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }

    const claims = await db.all('SELECT id FROM claims WHERE item_id = ?', [req.params.id]);
    for (const claim of claims) {
      await db.run('DELETE FROM qr_claim_slips WHERE claim_id = ?', [claim.id]);
      await db.run('DELETE FROM suspicious_flags WHERE claim_id = ?', [claim.id]);
      await db.run("DELETE FROM notifications WHERE reference_type = 'claim' AND reference_id = ?", [claim.id]);
    }
    await db.run('DELETE FROM claims WHERE item_id = ?', [req.params.id]);
    await db.run('DELETE FROM ai_matches WHERE lost_item_id = ? OR found_item_id = ?', [req.params.id, req.params.id]);
    await db.run("DELETE FROM notifications WHERE reference_type = 'item' AND reference_id = ?", [req.params.id]);
    await db.run('DELETE FROM items WHERE id = ?', [req.params.id]);
    await logActivity(req.user.id, 'delete_item', 'item', req.params.id, `Deleted item: ${item.title}`);
    res.json({ message: 'Item deleted successfully' });
  });

  // ==================== CLAIM ROUTES ====================

  app.get('/api/claims', authenticateToken, async (req: any, res) => {
    let query = 'SELECT claims.*, items.title as item_title, items.type as item_type, users.name as claimant_name FROM claims LEFT JOIN items ON claims.item_id = items.id LEFT JOIN users ON claims.user_id = users.id';
    const params: any[] = [];
    
    if (req.user.role === 'resident') {
      query += ' WHERE claims.user_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'official') {
      query += ' WHERE 1=1';
    }
    query += ' ORDER BY claims.created_at DESC';
    
    const claims = await db.all(query, params);
    res.json({ claims });
  });

  app.get('/api/claims/:id', authenticateToken, async (req, res) => {
    const claim = await db.get(`
      SELECT claims.*, items.title as item_title, items.type as item_type, items.description as item_description,
      users.name as claimant_name, users.contact_number as claimant_contact
      FROM claims 
      LEFT JOIN items ON claims.item_id = items.id 
      LEFT JOIN users ON claims.user_id = users.id
      WHERE claims.id = ?
    `, [req.params.id]);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    res.json(claim);
  });

  app.post('/api/claims', authenticateToken, async (req: any, res) => {
    const { item_id, message, proof_type, proof_url, facebook_url } = req.body;
    
    const parsedItemId = parseInt(String(item_id));
    const item = await db.get('SELECT * FROM items WHERE id = ?', [parsedItemId]);
    
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.status !== 'posted' && item.status !== 'matched') {
      return res.status(400).json({ error: 'This item cannot be claimed at this time' });
    }

    // Check for existing pending claim
    const existing = await db.get("SELECT * FROM claims WHERE item_id = ? AND user_id = ? AND status IN ('pending', 'under_review', 'approved')", 
      [parsedItemId, req.user.id]);
      
    if (existing) {
      return res.status(400).json({ error: 'You already have a pending claim on this item' });
    }

    if (!proof_url) {
      return res.status(400).json({ error: 'Proof photo is required' });
    }

    const result = await db.run(`
      INSERT INTO claims (item_id, user_id, message, proof_type, proof_url, facebook_url, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `, [parsedItemId, req.user.id, message, proof_type, proof_url, facebook_url]);

    await logActivity(req.user.id, 'create_claim', 'claim', result.lastID, `Claimed item: ${item.title}`);

    // Notify officials
    const officials = await db.all("SELECT id FROM users WHERE role IN ('admin', 'official')");
    for (const official of officials) {
      await db.run(`
        INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
        VALUES (?, 'new_claim', 'New Claim for Review', ?, ?, 'claim')
      `, [official.id, `A new claim has been submitted for item: ${item.title}`, result.lastID]);
    }

    res.status(201).json({ message: 'Claim submitted successfully', id: result.lastID });
  });

  app.put('/api/claims/:id/approve', authenticateToken, verifyRole(['admin', 'official']), async (req: any, res) => {
    const claim = await db.get('SELECT * FROM claims WHERE id = ?', [req.params.id]);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    if (claim.status !== 'pending' && claim.status !== 'under_review') {
      return res.status(400).json({ error: 'Claim cannot be approved' });
    }

    // Generate QR token
    const token = crypto.randomUUID();
    const qrData = JSON.stringify({
      claimId: claim.id,
      itemId: claim.item_id,
      token,
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    const parsedClaimId = parseInt(req.params.id);
    await db.run('UPDATE claims SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
      ['approved', req.user.id, parsedClaimId]);
    
    await db.run(`
      INSERT INTO qr_claim_slips (claim_id, token, qr_data, generated_by, expires_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP + interval '7 days')
    `, [parsedClaimId, token, qrData, req.user.id]);

    // Update item status
    await db.run('UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['claimed', claim.item_id]);

    await logActivity(req.user.id, 'approve_claim', 'claim', parsedClaimId, 'Claim approved');

    // Notify claimant
    await db.run(`
      INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type) 
      VALUES (?, 'claim_approved', 'Claim Approved!', 'Your claim has been approved. Please visit the barangay office with valid ID to claim your item.', ?, 'claim')
    `, [claim.user_id, parsedClaimId]);

    res.json({ message: 'Claim approved successfully', qrData });
  });

  app.put('/api/claims/:id/reject', authenticateToken, verifyRole(['admin', 'official']), async (req: any, res) => {
    const { remarks } = req.body;
    const claim = await db.get('SELECT * FROM claims WHERE id = ?', [req.params.id]);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    await db.run('UPDATE claims SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, remarks = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
      ['rejected', req.user.id, remarks, req.params.id]);

    await logActivity(req.user.id, 'reject_claim', 'claim', req.params.id, `Claim rejected: ${remarks}`);

    // Notify claimant
    await db.run(`
      INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type) 
      VALUES (?, 'claim_rejected', 'Claim Rejected', 'Your claim has been rejected. Reason: ' || ?, ?, 'claim')
    `, [claim.user_id, remarks, req.params.id]);

    res.json({ message: 'Claim rejected' });
  });

  app.put('/api/claims/:id/verify', authenticateToken, verifyRole(['admin', 'official']), async (req: any, res) => {
    const { token } = req.body;
    const claim = await db.get('SELECT * FROM claims WHERE id = ?', [req.params.id]);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    const qrSlip = await db.get('SELECT * FROM qr_claim_slips WHERE claim_id = ? AND token = ?', [req.params.id, token]);
    if (!qrSlip) return res.status(400).json({ error: 'Invalid QR token' });
    if (qrSlip.used_at) return res.status(400).json({ error: 'This claim slip has already been used' });

    // Mark as returned
    await db.run('UPDATE qr_claim_slips SET used_at = CURRENT_TIMESTAMP, used_by = ? WHERE id = ?', [req.user.id, qrSlip.id]);
    await db.run('UPDATE claims SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['returned', req.params.id]);
    await db.run('UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['returned', claim.item_id]);

    await logActivity(req.user.id, 'verify_claim', 'claim', req.params.id, 'Item returned');

    // Notify both parties
    await db.run(`
      INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type) 
      VALUES (?, 'item_returned', 'Item Returned', 'The item has been successfully returned to the claimant.', ?, 'claim')
    `, [claim.user_id, req.params.id]);

    res.json({ message: 'Item marked as returned' });
  });

  app.get('/api/claims/:id/qr', authenticateToken, async (req: any, res) => {
    const claim = await db.get('SELECT * FROM claims WHERE id = ?', [req.params.id]);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    if (claim.user_id !== req.user.id && req.user.role === 'resident') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const qrSlip = await db.get('SELECT * FROM qr_claim_slips WHERE claim_id = ?', [req.params.id]);
    if (!qrSlip) return res.status(404).json({ error: 'QR slip not found' });
    
    res.json(qrSlip);
  });

  // ==================== AI MATCHING ====================

  async function triggerAIMatching(itemId: number, itemType: string) {
    try {
      const oppositeType = itemType === 'lost' ? 'found' : 'lost';
      const item = await db.get('SELECT * FROM items WHERE id = ? AND status = ?', [itemId, 'posted']);
      if (!item) return;

      const existingItems = await db.all(`
        SELECT * FROM items WHERE type = ? AND status = 'posted' AND id != ?
      `, [oppositeType, itemId]);

      if (existingItems.length === 0) return;

      const context = existingItems.map((i: any) => 
        `ID: ${i.id} | Title: ${i.title} | Desc: ${i.description} | Loc: ${i.location} | Date: ${i.date_found || i.date_lost}`
      ).join('\n');

      const prompt = `
        You are an AI assistant for a Lost and Found system for Barangay Paknaan.
        Given a new ${item.type} item and a list of existing ${oppositeType} items, identify potential matches.
        
        New Item:
        Title: ${item.title}
        Description: ${item.description}
        Category: ${item.category}
        Location: ${item.location}
        Date: ${item.date_found || item.date_lost}

        Existing Items:
        ${context}

        Return a JSON array of objects with "id" and "score" (0-100) for potential matches. Only include matches with score > 60.
        Format: [{"id": 123, "score": 85}, {"id": 456, "score": 72}]
      `;

      if (!geminiApiKey) {
        console.log('AI matching skipped: No Gemini API Key');
        return;
      }

      const { GoogleGenAI, Type } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                score: { type: Type.INTEGER }
              }
            }
          }
        }
      });

      const matches = JSON.parse(response.text || '[]');
      
      for (const match of matches) {
        const lostId = itemType === 'lost' ? itemId : match.id;
        const foundId = itemType === 'found' ? itemId : match.id;
        
        await db.run(`
          INSERT INTO ai_matches (lost_item_id, found_item_id, confidence_score, status) VALUES (?, ?, ?, 'pending')
        `, [lostId, foundId, match.score]);
      }

      console.log(`AI matching complete: Found ${matches.length} potential matches`);
    } catch (error) {
      console.error('AI matching error:', error);
    }
  }

  app.get('/api/ai/matches', authenticateToken, verifyRole(['admin', 'official']), async (req, res) => {
    const matches = await db.all(`
      SELECT m.*, 
        l.title as lost_title, l.type as lost_type,
        f.title as found_title, f.type as found_type
      FROM ai_matches m
      LEFT JOIN items l ON m.lost_item_id = l.id
      LEFT JOIN items f ON m.found_item_id = f.id
      ORDER BY m.confidence_score DESC
    `);
    res.json(matches);
  });

  app.get('/api/ai/matches/my', authenticateToken, async (req: any, res) => {
    const matches = await db.all(`
      SELECT m.*, 
        l.title as lost_title, l.user_id as lost_user_id,
        f.title as found_title, f.user_id as found_user_id
      FROM ai_matches m
      LEFT JOIN items l ON m.lost_item_id = l.id
      LEFT JOIN items f ON m.found_item_id = f.id
      WHERE (l.user_id = ? OR f.user_id = ?) AND m.status = 'pending'
    `, [req.user.id, req.user.id]);
    res.json(matches);
  });

  app.put('/api/ai/matches/:id/confirm', authenticateToken, verifyRole(['admin', 'official']), async (req: any, res) => {
    const match = await db.get('SELECT * FROM ai_matches WHERE id = ?', [req.params.id]);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    await db.run('UPDATE ai_matches SET status = ?, confirmed_by = ?, confirmed_at = CURRENT_TIMESTAMP WHERE id = ?', 
      ['confirmed', req.user.id, req.params.id]);
    
    await db.run('UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (?, ?)', 
      ['matched', match.lost_item_id, match.found_item_id]);

    const lostItem = await db.get('SELECT user_id, title FROM items WHERE id = ?', [match.lost_item_id]);
    const foundItem = await db.get('SELECT user_id, title FROM items WHERE id = ?', [match.found_item_id]);

    if (lostItem) {
      await db.run(`INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type) VALUES (?, 'match_found', 'Possible Match Found', 'A possible match has been found for your item: ' || ?, ?, 'item')`, 
        [lostItem.user_id, lostItem.title, match.lost_item_id]);
    }
    if (foundItem) {
      await db.run(`INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type) VALUES (?, 'match_found', 'Possible Match Found', 'A possible match has been found for your item: ' || ?, ?, 'item')`, 
        [foundItem.user_id, foundItem.title, match.found_item_id]);
    }

    res.json({ message: 'Match confirmed' });
  });

  app.put('/api/ai/matches/:id/reject', authenticateToken, verifyRole(['admin', 'official']), async (req, res) => {
    await db.run('UPDATE ai_matches SET status = ? WHERE id = ?', ['rejected', req.params.id]);
    res.json({ message: 'Match rejected' });
  });

  // ==================== NOTIFICATION ROUTES ====================

  app.get('/api/notifications', authenticateToken, async (req: any, res) => {
    const notifications = await db.all(`
      SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
    `, [req.user.id]);
    res.json(notifications);
  });

  app.put('/api/notifications/:id/read', authenticateToken, async (req: any, res) => {
    await db.run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Notification marked as read' });
  });

  app.put('/api/notifications/read-all', authenticateToken, async (req: any, res) => {
    await db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'All notifications marked as read' });
  });

  // ==================== ADMIN ROUTES ====================

  app.get('/api/admin/dashboard', authenticateToken, verifyRole(['admin', 'official']), async (req, res) => {
    const stats = {
      totalUsers: (await db.get('SELECT COUNT(*) as count FROM users'))?.count || 0,
      totalLost: (await db.get("SELECT COUNT(*) as count FROM items WHERE type = 'lost'"))?.count || 0,
      totalFound: (await db.get("SELECT COUNT(*) as count FROM items WHERE type = 'found'"))?.count || 0,
      pendingApprovals: (await db.get("SELECT COUNT(*) as count FROM items WHERE status = 'pending'"))?.count || 0,
      pendingClaims: (await db.get("SELECT COUNT(*) as count FROM claims WHERE status = 'pending'"))?.count || 0,
      itemsReturned: (await db.get("SELECT COUNT(*) as count FROM items WHERE status = 'returned'"))?.count || 0,
      rejectedReports: (await db.get("SELECT COUNT(*) as count FROM items WHERE status = 'rejected'"))?.count || 0,
    };

    const typeStats = await db.all(`
      SELECT type, COUNT(*) as count FROM items GROUP BY type
    `);

    const categoryStats = await db.all(`
      SELECT category, COUNT(*) as count FROM items WHERE status NOT IN ('rejected', 'archived') GROUP BY category ORDER BY count DESC LIMIT 5
    `);

    const zoneStats = await db.all(`
      SELECT purok as zone, COUNT(*) as count FROM items WHERE status NOT IN ('rejected', 'archived') GROUP BY purok ORDER BY count DESC
    `);

    const reportsTrend = await db.all(`
      SELECT TO_CHAR(created_at, 'Mon DD') as day, COUNT(*) as count 
      FROM items 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' 
      GROUP BY day, date_trunc('day', created_at)
      ORDER BY date_trunc('day', created_at) ASC
    `);

    const recentActivity = await db.all(`
      SELECT al.*, u.name as user_name FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT 20
    `);

    res.json({ stats, typeStats, categoryStats, zoneStats, reportsTrend, recentActivity });
  });

  app.get('/api/admin/logs', authenticateToken, verifyRole(['admin']), async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const logs = await db.all(`
      SELECT al.*, u.name as user_name 
      FROM activity_logs al 
      LEFT JOIN users u ON al.user_id = u.id 
      ORDER BY al.created_at DESC 
      LIMIT ? OFFSET ?
    `, [Number(limit), (Number(page) - 1) * Number(limit)]);
    res.json(logs);
  });

  app.get('/api/admin/users', authenticateToken, verifyRole(['admin']), async (req, res) => {
    const { search, role, page = 1, limit = 20 } = req.query;
    let query = 'SELECT id, name, email, role, purok as zone, verified_at, status, created_at FROM users WHERE 1=1';
    const params: any[] = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));
    
    const users = await db.all(query, params);
    res.json(users);
  });

  app.put('/api/admin/users/:id/role', authenticateToken, verifyRole(['admin']), async (req: any, res) => {
    const { role } = req.body;
    if (!['admin', 'official', 'resident'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    await db.run('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [role, req.params.id]);
    await logActivity(req.user.id, 'change_role', 'user', Number(req.params.id), `Role changed to ${role}`);
    res.json({ message: 'Role updated successfully' });
  });

  app.put('/api/admin/users/:id/verify', authenticateToken, verifyRole(['admin', 'official']), async (req: any, res) => {
    await db.run('UPDATE users SET verified_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
    res.json({ message: 'User verified successfully' });
  });

  app.put('/api/admin/users/:id/suspend', authenticateToken, verifyRole(['admin']), async (req: any, res) => {
    await db.run('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['suspended', req.params.id]);
    await logActivity(req.user.id, 'suspend_user', 'user', Number(req.params.id), 'User suspended');
    res.json({ message: 'User suspended successfully' });
  });

  app.put('/api/admin/users/:id/reactivate', authenticateToken, verifyRole(['admin']), async (req: any, res) => {
    await db.run('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['active', req.params.id]);
    await logActivity(req.user.id, 'reactivate_user', 'user', Number(req.params.id), 'User reactivated');
    res.json({ message: 'User reactivated successfully' });
  });

  // ==================== REPORT ROUTES ====================

  app.get('/api/reports/monthly', authenticateToken, verifyRole(['admin', 'official']), async (req, res) => {
    const { month } = req.query;
    
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const report = {
      period: month,
      totalLost: (await db.get(`SELECT COUNT(*) as count FROM items WHERE type = 'lost' AND created_at >= ? AND created_at <= ?`, [startDate, endDate]))?.count || 0,
      totalFound: (await db.get(`SELECT COUNT(*) as count FROM items WHERE type = 'found' AND created_at >= ? AND created_at <= ?`, [startDate, endDate]))?.count || 0,
      totalReturned: (await db.get(`SELECT COUNT(*) as count FROM items WHERE status = 'returned' AND updated_at >= ? AND updated_at <= ?`, [startDate, endDate]))?.count || 0,
      pendingClaims: (await db.get(`SELECT COUNT(*) as count FROM claims WHERE status = 'pending' AND created_at >= ? AND created_at <= ?`, [startDate, endDate]))?.count || 0,
      claimsApproved: (await db.get(`SELECT COUNT(*) as count FROM claims WHERE status = 'approved' AND created_at >= ? AND created_at <= ?`, [startDate, endDate]))?.count || 0,
      newUsers: (await db.get(`SELECT COUNT(*) as count FROM users WHERE created_at >= ? AND created_at <= ?`, [startDate, endDate]))?.count || 0,
    };

    res.json(report);
  });

  // ==================== BADGE ROUTES ====================

  app.get('/api/badges', async (req, res) => {
    const badges = await db.all('SELECT * FROM badges');
    res.json(badges);
  });

  app.get('/api/users/:id/badges', async (req, res) => {
    const userBadges = await db.all(`
      SELECT b.*, ub.awarded_at FROM user_badges ub 
      LEFT JOIN badges b ON ub.badge_id = b.id 
      WHERE ub.user_id = ?
    `, [req.params.id]);
    res.json(userBadges);
  });

  // ==================== UPLOAD ROUTES ====================

  app.post('/api/upload/image', authenticateToken, upload.single('image'), async (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filename = req.file.filename || `${Date.now()}-${req.file.originalname}`;
    const url = IS_VERCEL
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : `/uploads/${filename}`;
    res.json({ 
      url,
      filename: filename
    });
  });

  app.post('/api/upload/profile', authenticateToken, upload.single('photo'), async (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filename = req.file.filename || `${Date.now()}-${req.file.originalname}`;
    const url = IS_VERCEL
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : `/uploads/${filename}`;
    await db.run('UPDATE users SET photo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
      [url, req.user.id]);
    res.json({ 
      url,
      filename
    });
  });

  // ==================== CONSTANTS ====================

  app.get('/api/constants', (req, res) => {
    res.json({ categories: CATEGORIES, zones: ZONES });
  });

  // ==================== FRONTEND HANDLING ====================

  // Only run Vite development server if we are local and not in production mode
  if (!IS_VERCEL && process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) return next();
      try {
        let template = await vite.transformIndexHtml(url, `<!DOCTYPE html><html><head></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // In production on Vercel, static files and SPA fallback are handled by vercel.json.
    // This server instance will primarily serve API routes.
    // No explicit static serving or catch-all route needed here for Vercel.
  }

  // Local development listener
  if (!IS_VERCEL) {
    const server = app.listen(PORT, () => {
      console.log(`\x1b[32m%s\x1b[0m`, `Ready! Access your app at: http://localhost:${PORT}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\x1b[31m%s\x1b[0m`, `Error: Port ${PORT} is already in use. Try closing the other process or changing the PORT constant.`);
      } else {
        console.error(`\x1b[31m%s\x1b[0m`, `Server failed to start:`, err);
      }
    });
  }
}

// Start the server initialization
startServer().catch(err => {
  console.error(`\x1b[31m%s\x1b[0m`, `Failed to start server:`, err);
});

export default app;
