const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'msp_prioritiser.sqlite');
const db = new DatabaseSync(dbPath);

// Initialize schema
db.exec(`
CREATE TABLE IF NOT EXISTS organisations (
  organisation_id TEXT PRIMARY KEY,
  organisation_name TEXT NOT NULL,
  contract_level TEXT NOT NULL,
  sla_critical_target_mins INTEGER NOT NULL,
  operating_schedule TEXT NOT NULL,
  critical_services TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  organisation_id TEXT NOT NULL,
  organisation_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS config_thresholds (
  id INTEGER PRIMARY KEY,
  weight_clinical INTEGER NOT NULL DEFAULT 30,
  weight_business INTEGER NOT NULL DEFAULT 25,
  weight_criticality INTEGER NOT NULL DEFAULT 20,
  weight_users INTEGER NOT NULL DEFAULT 10,
  weight_schedule INTEGER NOT NULL DEFAULT 10,
  weight_contract INTEGER NOT NULL DEFAULT 5,
  threshold_critical INTEGER NOT NULL DEFAULT 80,
  threshold_high INTEGER NOT NULL DEFAULT 60,
  threshold_medium INTEGER NOT NULL DEFAULT 30,
  updated_by TEXT NOT NULL DEFAULT 'System Admin',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
  ticket_id TEXT PRIMARY KEY,
  organisation_id TEXT NOT NULL,
  organisation_name TEXT NOT NULL,
  contract_level TEXT NOT NULL,
  created_date_time TEXT NOT NULL,
  ticket_content TEXT NOT NULL,
  affected_service TEXT NOT NULL,
  service_category TEXT NOT NULL,
  user_group TEXT NOT NULL,
  number_of_affected_users INTEGER NOT NULL,
  operating_schedule TEXT NOT NULL,
  submitted_during_operating_hours INTEGER NOT NULL,
  escalation_requested INTEGER NOT NULL,
  escalation_outcome TEXT NOT NULL,
  actual_impact TEXT NOT NULL,
  response_time_minutes INTEGER NOT NULL,
  resolution_time_minutes INTEGER NOT NULL,
  incident_status TEXT NOT NULL,
  baseline_priority TEXT NOT NULL,
  baseline_explanation TEXT,
  improved_priority TEXT NOT NULL,
  improved_explanation TEXT,
  clinical_score INTEGER DEFAULT 0,
  business_score INTEGER DEFAULT 0,
  criticality_score INTEGER DEFAULT 0,
  users_score INTEGER DEFAULT 0,
  schedule_score INTEGER DEFAULT 0,
  contract_score INTEGER DEFAULT 0,
  total_impact_score INTEGER DEFAULT 0,
  evidence_json TEXT,
  final_priority TEXT NOT NULL,
  is_overridden INTEGER DEFAULT 0,
  override_reason TEXT,
  override_user TEXT,
  override_timestamp TEXT,
  is_edge_case INTEGER DEFAULT 0,
  edge_case_type TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  organisation_name TEXT NOT NULL,
  original_priority TEXT NOT NULL,
  updated_priority TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence_summary TEXT
);

CREATE INDEX IF NOT EXISTS idx_tickets_org ON tickets(organisation_id);
CREATE INDEX IF NOT EXISTS idx_tickets_final_priority ON tickets(final_priority);
CREATE INDEX IF NOT EXISTS idx_tickets_improved_priority ON tickets(improved_priority);
CREATE INDEX IF NOT EXISTS idx_audit_ticket ON audit_logs(ticket_id);
`);

// Seed default organizations if empty
const orgCountStmt = db.prepare('SELECT COUNT(*) as count FROM organisations');
const orgCount = orgCountStmt.get().count;

if (orgCount === 0) {
  const insertOrg = db.prepare(`
    INSERT INTO organisations (organisation_id, organisation_name, contract_level, sla_critical_target_mins, operating_schedule, critical_services)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertOrg.run('ORG-01', 'CityCare Hospital', 'Platinum', 15, '24/7', 'Electronic Health Record, Emergency Department System, Medication Management');
  insertOrg.run('ORG-02', 'Metro Health Clinic', 'Gold', 30, 'Extended Hours', 'Patient Portal, Appointment System, Authentication Service');
  insertOrg.run('ORG-03', 'MedTech Partner Services', 'Gold', 30, '24/7', 'Network, Authentication Service, Electronic Health Record');
  insertOrg.run('ORG-04', 'Retail Business Services', 'Standard', 60, 'Business Hours', 'Payment System, Payroll, Email, Printing');

  console.log('Sample organisations seeded.');
}

// Seed default users if empty
const userCountStmt = db.prepare('SELECT COUNT(*) as count FROM users');
const userCount = userCountStmt.get().count;

if (userCount === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, name, role, organisation_id, organisation_name)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('USR-01', 'admin', 'Marcus Bradley', 'MSP Administrator', 'MSP-INTERNAL', 'Global Managed Services');
  insertUser.run('USR-02', 'analyst', 'Sophia Chen', 'MSP Support Analyst', 'MSP-INTERNAL', 'Global Managed Services');
  insertUser.run('USR-03', 'citycare_user', 'Dr. Evelyn Vance', 'Customer Organisation User', 'ORG-01', 'CityCare Hospital');
  insertUser.run('USR-04', 'metro_user', 'James Miller (Clinic Lead)', 'Customer Organisation User', 'ORG-02', 'Metro Health Clinic');
  insertUser.run('USR-05', 'partner_user', 'Alex Mercer', 'External Partner', 'ORG-03', 'MedTech Partner Services');

  console.log('Sample users seeded.');
}

// Seed default configuration if empty
const configCountStmt = db.prepare('SELECT COUNT(*) as count FROM config_thresholds');
const configCount = configCountStmt.get().count;

if (configCount === 0) {
  db.exec(`
    INSERT INTO config_thresholds (
      id, weight_clinical, weight_business, weight_criticality, weight_users, weight_schedule, weight_contract,
      threshold_critical, threshold_high, threshold_medium, updated_by
    ) VALUES (
      1, 30, 25, 20, 10, 10, 5, 80, 60, 30, 'System Default'
    );
  `);
  console.log('Default config thresholds seeded.');
}

module.exports = db;
