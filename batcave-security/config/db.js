const Database = require('better-sqlite3');
const db = new Database('oauth_demo.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS oauth_sessions (
    state TEXT PRIMARY KEY,
    code_verifier TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    provider TEXT DEFAULT 'google'
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    note TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

db.exec(`
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

module.exports = db;