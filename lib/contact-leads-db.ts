import "server-only";

import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

interface ContactLeadRecord {
  contactType: "particulier" | "entreprise";
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  companyName: string;
  companyRole: string;
  siret: string;
  activity: string;
  consent: boolean;
  marketingConsent: boolean;
  retentionMonths: number;
  policyVersion: string;
  sourceIp: string;
  userAgent: string;
  adminEmailSent: boolean;
  acknowledgementSent: boolean;
}

type ContactDb = Database.Database;

let dbInstance: ContactDb | null = null;

function getDatabasePath(): string {
  const dataDir = path.join(process.cwd(), "data");
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
  `);

  dbInstance = db;
  return db;
}

export function insertContactLead(record: ContactLeadRecord): number {
  const db = getDb();

  const statement = db.prepare(`
    INSERT INTO contact_leads (
      created_at,
      contact_type,
      full_name,
      email,
      phone,
      subject,
      message,
      company_name,
      company_role,
      siret,
      activity,
      consent,
      marketing_consent,
      retention_months,
      policy_version,
      source_ip,
      user_agent,
      admin_email_sent,
      acknowledgement_sent
    ) VALUES (
      @createdAt,
      @contactType,
      @fullName,
      @email,
      @phone,
      @subject,
      @message,
      @companyName,
      @companyRole,
      @siret,
      @activity,
      @consent,
      @marketingConsent,
      @retentionMonths,
      @policyVersion,
      @sourceIp,
      @userAgent,
      @adminEmailSent,
      @acknowledgementSent
    )
  `);

  const result = statement.run({
    createdAt: new Date().toISOString(),
    contactType: record.contactType,
    fullName: record.fullName,
    email: record.email,
    phone: record.phone,
    subject: record.subject,
    message: record.message,
    companyName: record.companyName,
    companyRole: record.companyRole,
    siret: record.siret,
    activity: record.activity,
    consent: record.consent ? 1 : 0,
    marketingConsent: record.marketingConsent ? 1 : 0,
    retentionMonths: record.retentionMonths,
    policyVersion: record.policyVersion,
    sourceIp: record.sourceIp,
    userAgent: record.userAgent,
    adminEmailSent: record.adminEmailSent ? 1 : 0,
    acknowledgementSent: record.acknowledgementSent ? 1 : 0,
  });

  return Number(result.lastInsertRowid);
}
