const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { DB } = require('../config/constants');

const dbFile = path.isAbsolute(DB.FILE) ? DB.FILE : path.join(__dirname, '..', '..', DB.FILE);
const dataDir = path.dirname(dbFile);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pen_name TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS letters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    parent_id INTEGER,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES letters(id)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    letter_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(user_id, letter_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (letter_id) REFERENCES letters(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS help_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    deadline_at INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    accepted_reply_id INTEGER,
    closed_at INTEGER,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS help_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    replier_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER NOT NULL,
    UNIQUE(request_id, replier_id),
    FOREIGN KEY (request_id) REFERENCES help_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (replier_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_letters_sender ON letters(sender_id);
  CREATE INDEX IF NOT EXISTS idx_letters_receiver ON letters(receiver_id);
  CREATE INDEX IF NOT EXISTS idx_letters_parent ON letters(parent_id);
  CREATE INDEX IF NOT EXISTS idx_help_requests_owner ON help_requests(owner_id);
  CREATE INDEX IF NOT EXISTS idx_help_replies_request ON help_replies(request_id);
`);

module.exports = db;
