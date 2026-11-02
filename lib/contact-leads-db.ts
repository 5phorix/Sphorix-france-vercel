import "server-only";

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import Database from "better-sqlite3";

type ContactDb = Database.Database;

let dbInstance: ContactDb | null = null;

function getDatabasePath(): string {
  const configuredPath = process.env.CONTACT_DB_PATH;
  if (configuredPath) {
    return configuredPath;
  }

  const dataDir = process.env.VERCEL
    ? os.tmpdir()
    : path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  return path.join(dataDir, "contact-leads.sqlite");
}

function getDb(): ContactDb {
  if (dbInstance) {
    return dbInstance;
  }

  const db = new Database(getDatabasePath());

  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      contact_type TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      company_name TEXT,
      company_role TEXT,
      siret TEXT,
      activity TEXT,
      consent INTEGER NOT NULL,
      marketing_consent INTEGER NOT NULL,
      retention_months INTEGER NOT NULL,
      policy_version TEXT NOT NULL,
      source_ip TEXT,
      user_agent TEXT,
      admin_email_sent INTEGER NOT NULL,
      acknowledgement_sent INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_contact_leads_created_at
      ON contact_leads(created_at);

    CREATE INDEX IF NOT EXISTS idx_contact_leads_email
      ON contact_leads(email);

    CREATE TABLE IF NOT EXISTS rate_limit_entries (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      window_start INTEGER NOT NULL
    );
  `);

  dbInstance = db;
  return db;
}

export function consumeRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const db = getDb();
  const now = Date.now();
  db.prepare("DELETE FROM rate_limit_entries WHERE window_start < ?").run(now - windowMs);
  db.prepare(`
    DELETE FROM contact_leads
    WHERE julianday(created_at) <= julianday(
      'now',
      '-' || retention_months || ' months'
    )
  `).run();

  const current = db
    .prepare("SELECT count, window_start FROM rate_limit_entries WHERE key = ?")
    .get(key) as { count: number; window_start: number } | undefined;

  if (!current || now - current.window_start >= windowMs) {
    db.prepare(
      `INSERT INTO rate_limit_entries (key, count, window_start)
       VALUES (?, 1, ?)
       ON CONFLICT(key) DO UPDATE SET count = 1, window_start = excluded.window_start`
    ).run(key, now);
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  db.prepare(
    "UPDATE rate_limit_entries SET count = count + 1 WHERE key = ?"
  ).run(key);
  return true;
}
