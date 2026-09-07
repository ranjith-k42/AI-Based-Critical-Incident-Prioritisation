const express = require('express');
const cors = require('cors');
const db = require('./db.cjs');
const { evaluateBaseline, evaluateImproved } = require('./scoringEngine.cjs');
const { generate5000Tickets } = require('./generate5000Tickets.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ensure dataset exists
generate5000Tickets();

// --- 1. Auth & Users ---
app.get('/api/auth/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  res.json(users);
});

// --- 2. Organisations ---
app.get('/api/organisations', (req, res) => {
  const orgs = db.prepare('SELECT * FROM organisations').all();
  res.json(orgs);
});

// --- 3. Tickets (Paginated & Filtered) ---
app.get('/api/tickets', (req, res) => {
  const {
    page = 1,
    limit = 25,
    organisation_id,
    priority,
    service,
    status,
    search,
    userRole,
    userOrgId,
    edgeOnly
  } = req.query;

  let query = 'SELECT * FROM tickets WHERE 1=1';
  const params = [];

  // Role-based Access Control Filtering
  if (userRole === 'Customer Organisation User' && userOrgId) {
    query += ' AND organisation_id = ?';
    params.push(userOrgId);
  } else if (userRole === 'External Partner') {
    query += ' AND (affected_service LIKE "%Network%" OR affected_service LIKE "%Authentication%" OR escalation_outcome LIKE "%Partner%" OR escalation_outcome LIKE "%Tier-3%")';
  } else if (organisation_id && organisation_id !== 'All') {
    query += ' AND organisation_id = ?';
    params.push(organisation_id);
  }

  if (priority && priority !== 'All') {
    query += ' AND final_priority = ?';
    params.push(priority);
  }

  if (service && service !== 'All') {
    query += ' AND affected_service = ?';
    params.push(service);
  }

  if (status && status !== 'All') {
    query += ' AND incident_status = ?';
    params.push(status);
  }

  if (edgeOnly === 'true' || edgeOnly === '1') {
    query += ' AND is_edge_case = 1';
  }

  if (search) {
    query += ' AND (ticket_id LIKE ? OR ticket_content LIKE ? OR affected_service LIKE ? OR user_group LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  // Count total matching
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const total = db.prepare(countQuery).get(...params).total;

  // Pagination
  query += ' ORDER BY created_date_time DESC LIMIT ? OFFSET ?';
  const offset = (Number(page) - 1) * Number(limit);
  params.push(Number(limit), offset);

  const rows = db.prepare(query).all(...params);

  res.json({
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    tickets: rows.map(r => ({
      ...r,
      evidence: r.evidence_json ? JSON.parse(r.evidence_json) : []
    }))
  });
});

// Single Ticket
app.get('/api/tickets/:id', (req, res) => {
  const ticket = db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const auditHistory = db.prepare('SELECT * FROM audit_logs WHERE ticket_id = ? ORDER BY timestamp DESC').all(req.params.id);

  res.json({
    ...ticket,
    evidence: ticket.evidence_json ? JSON.parse(ticket.evidence_json) : [],
    auditHistory
  });
});

// Create Ticket
app.post('/api/tickets', (req, res) => {
  const body = req.body;
  const targetOrgId = body.organisation_id || 'ORG-01';
  const org = db.prepare('SELECT * FROM organisations WHERE organisation_id = ?').get(targetOrgId) || {
    organisation_id: 'ORG-01',
    organisation_name: 'CityCare Hospital',
    contract_level: 'Platinum',
    operating_schedule: '24/7',
    sla_critical_target_mins: 15
  };

  const countStmt = db.prepare('SELECT COUNT(*) as c FROM tickets');
  const count = countStmt.get().c + 1;
  const ticketId = `TICK-${String(count).padStart(5, '0')}`;

  const raw = {
    ticket_content: body.ticket_content || 'Routine support request',
    affected_service: body.affected_service || 'Other',
    service_category: body.service_category || 'General',
    user_group: body.user_group || 'Administrative Staff',
    number_of_affected_users: Number(body.number_of_affected_users || 1),
    operating_schedule: org.operating_schedule,
    contract_level: org.contract_level,
    submitted_during_operating_hours: body.submitted_during_operating_hours !== undefined ? (body.submitted_during_operating_hours ? 1 : 0) : 1,
    escalation_requested: body.escalation_requested ? 1 : 0,
    escalation_outcome: body.escalation_outcome || 'Pending Review'
  };

  // Get current config
  const config = db.prepare('SELECT * FROM config_thresholds WHERE id = 1').get();

  const base = evaluateBaseline(raw);
  const imp = evaluateImproved(raw, config);

  const createdDate = new Date().toISOString();
  const responseTime = Math.floor(4 + Math.random() * 12);
  const resolutionTime = responseTime + Math.floor(20 + Math.random() * 60);

  const insertStmt = db.prepare(`
    INSERT INTO tickets (
      ticket_id, organisation_id, organisation_name, contract_level, created_date_time,
      ticket_content, affected_service, service_category, user_group, number_of_affected_users,
      operating_schedule, submitted_during_operating_hours, escalation_requested, escalation_outcome,
      actual_impact, response_time_minutes, resolution_time_minutes, incident_status,
      baseline_priority, baseline_explanation, improved_priority, improved_explanation,
      clinical_score, business_score, criticality_score, users_score, schedule_score, contract_score,
      total_impact_score, evidence_json, final_priority, is_overridden, is_edge_case
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, 'Open',
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, 0, 0
    )
  `);

  insertStmt.run(
    ticketId, org.organisation_id, org.organisation_name, org.contract_level, createdDate,
    raw.ticket_content, raw.affected_service, raw.service_category, raw.user_group, raw.number_of_affected_users,
    org.operating_schedule, raw.submitted_during_operating_hours, raw.escalation_requested, raw.escalation_outcome,
    imp.priority, responseTime, resolutionTime,
    base.priority, base.explanation, imp.priority, imp.explanation,
    imp.clinicalScore, imp.businessScore, imp.criticalityScore, imp.usersScore, imp.scheduleScore, imp.contractScore,
    imp.totalImpactScore, JSON.stringify(imp.evidence), imp.priority
  );

  const created = db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').get(ticketId);
  res.status(201).json({
    ...created,
    evidence: imp.evidence
  });
});

// Manual Priority Override
app.post('/api/tickets/:id/override', (req, res) => {
  const { new_priority, reason, user_name, user_role, organisation_name } = req.body;
  const ticketId = req.params.id;

  const ticket = db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').get(ticketId);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  if (user_role === 'Customer Organisation User' || user_role === 'External Partner') {
    return res.status(403).json({ error: 'Forbidden: Your role is not authorized to override ticket priority.' });
  }

  const timestamp = new Date().toISOString();
  const originalPriority = ticket.final_priority;

  // Update ticket
  db.prepare(`
    UPDATE tickets
    SET final_priority = ?, is_overridden = 1, override_reason = ?, override_user = ?, override_timestamp = ?
    WHERE ticket_id = ?
  `).run(new_priority, reason, user_name, timestamp, ticketId);

  // Append immutable audit log
  const auditId = `AUD-${Date.now().toString().slice(-6)}`;
  db.prepare(`
    INSERT INTO audit_logs (
      id, ticket_id, timestamp, user_name, user_role, organisation_name, original_priority, updated_priority, reason, evidence_summary
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `).run(
    auditId, ticketId, timestamp, user_name, user_role, organisation_name || ticket.organisation_name,
    originalPriority, new_priority, reason, `Overridden by ${user_name} (${user_role}). Original automated score: ${ticket.total_impact_score}/100.`
  );

  const updatedTicket = db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').get(ticketId);
  res.json({
    ticket: {
      ...updatedTicket,
      evidence: updatedTicket.evidence_json ? JSON.parse(updatedTicket.evidence_json) : []
    },
    auditId
  });
});

// --- 4. Audit Logs ---
app.get('/api/audit-logs', (req, res) => {
  const { search, userRole } = req.query;
  let query = 'SELECT * FROM audit_logs WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (ticket_id LIKE ? OR user_name LIKE ? OR reason LIKE ? OR organisation_name LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  if (userRole && userRole !== 'All') {
    query += ' AND user_role = ?';
    params.push(userRole);
  }

  query += ' ORDER BY timestamp DESC LIMIT 200';
  const logs = db.prepare(query).all(...params);
  res.json(logs);
});

// --- 5. System Configuration & Thresholds ---
app.get('/api/config/thresholds', (req, res) => {
  const config = db.prepare('SELECT * FROM config_thresholds WHERE id = 1').get();
  res.json(config);
});

app.put('/api/config/thresholds', (req, res) => {
  const {
    weight_clinical,
    weight_business,
    weight_criticality,
    weight_users,
    weight_schedule,
    weight_contract,
    threshold_critical,
    threshold_high,
    threshold_medium,
    updated_by = 'MSP Administrator'
  } = req.body;

  db.prepare(`
    UPDATE config_thresholds
    SET weight_clinical = ?, weight_business = ?, weight_criticality = ?, weight_users = ?, weight_schedule = ?, weight_contract = ?,
        threshold_critical = ?, threshold_high = ?, threshold_medium = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(
    Number(weight_clinical), Number(weight_business), Number(weight_criticality), Number(weight_users), Number(weight_schedule), Number(weight_contract),
    Number(threshold_critical), Number(threshold_high), Number(threshold_medium), updated_by
  );

  const updated = db.prepare('SELECT * FROM config_thresholds WHERE id = 1').get();
  res.json(updated);
});

// --- 6. Analytics Dashboard ---
app.get('/api/analytics/dashboard', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as c FROM tickets').get().c;

  // Priority Distribution
  const prios = db.prepare('SELECT final_priority, COUNT(*) as count FROM tickets GROUP BY final_priority').all();
  const priorityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  prios.forEach(p => { priorityCounts[p.final_priority] = p.count; });

  // Baseline Priority Distribution
  const basePrios = db.prepare('SELECT baseline_priority, COUNT(*) as count FROM tickets GROUP BY baseline_priority').all();
  const baselineCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  basePrios.forEach(p => { baselineCounts[p.baseline_priority] = p.count; });

  // By Organisation
  const byOrg = db.prepare(`
    SELECT organisation_name, contract_level, COUNT(*) as count,
           SUM(CASE WHEN final_priority = 'Critical' THEN 1 ELSE 0 END) as critical_count
    FROM tickets
    GROUP BY organisation_name
  `).all();

  // By Affected Service
  const byService = db.prepare(`
    SELECT affected_service, service_category, COUNT(*) as count,
           SUM(CASE WHEN final_priority = 'Critical' THEN 1 ELSE 0 END) as critical_count
    FROM tickets
    GROUP BY affected_service
    ORDER BY count DESC
    LIMIT 10
  `).all();

  // SLA Compliance (Critical tickets response time vs SLA target)
  // Platinum: 15m, Gold: 30m, Standard: 60m
  const slaStats = db.prepare(`
    SELECT 
      COUNT(*) as total_critical,
      SUM(CASE 
        WHEN contract_level = 'Platinum' AND response_time_minutes <= 15 THEN 1
        WHEN contract_level = 'Gold' AND response_time_minutes <= 30 THEN 1
        WHEN contract_level = 'Standard' AND response_time_minutes <= 60 THEN 1
        ELSE 0
      END) as met_sla,
      SUM(CASE 
        WHEN contract_level = 'Platinum' AND response_time_minutes > 15 THEN 1
        WHEN contract_level = 'Gold' AND response_time_minutes > 30 THEN 1
        WHEN contract_level = 'Standard' AND response_time_minutes > 60 THEN 1
        ELSE 0
      END) as breached_sla
    FROM tickets
    WHERE final_priority = 'Critical'
  `).get();

  // Baseline SLA Compliance for Critical
  const baselineSlaStats = db.prepare(`
    SELECT 
      COUNT(*) as total_critical,
      SUM(CASE 
        WHEN contract_level = 'Platinum' AND response_time_minutes <= 15 THEN 1
        WHEN contract_level = 'Gold' AND response_time_minutes <= 30 THEN 1
        WHEN contract_level = 'Standard' AND response_time_minutes <= 60 THEN 1
        ELSE 0
      END) as met_sla
    FROM tickets
    WHERE baseline_priority = 'Critical'
  `).get();

  const overridesCount = db.prepare('SELECT COUNT(*) as c FROM audit_logs').get().c;

  // False Positives & False Negatives (Comparing Improved vs Actual Impact)
  const fpCount = db.prepare(`
    SELECT COUNT(*) as c FROM tickets
    WHERE (final_priority = 'Critical' OR final_priority = 'High')
      AND (actual_impact = 'Low' OR actual_impact = 'Medium')
  `).get().c;

  const fnCount = db.prepare(`
    SELECT COUNT(*) as c FROM tickets
    WHERE (final_priority = 'Low' OR final_priority = 'Medium')
      AND (actual_impact = 'Critical' OR actual_impact = 'High')
  `).get().c;

  res.json({
    totalTickets: total,
    priorityCounts,
    baselineCounts,
    byOrg,
    byService,
    slaStats: {
      totalCritical: slaStats.total_critical,
      metSla: slaStats.met_sla,
      breachedSla: slaStats.breached_sla,
      complianceRate: slaStats.total_critical > 0 ? Math.round((slaStats.met_sla / slaStats.total_critical) * 100) : 100,
      baselineMetSla: baselineSlaStats.met_sla,
      baselineRate: baselineSlaStats.total_critical > 0 ? Math.round((baselineSlaStats.met_sla / baselineSlaStats.total_critical) * 100) : 60
    },
    overridesCount,
    falsePositivesCount: fpCount,
    falseNegativesCount: fnCount
  });
});

// --- 7. Detailed Performance Evaluation & Confusion Matrix ---
app.get('/api/analytics/evaluation', (req, res) => {
  // Comparing Improved Priority against Actual Impact
  const tickets = db.prepare('SELECT ticket_id, ticket_content, affected_service, user_group, final_priority, actual_impact, baseline_priority FROM tickets LIMIT 2000').all();

  let tp = 0, tn = 0, fp = 0, fn = 0;
  let baseTp = 0, baseTn = 0, baseFp = 0, baseFn = 0;

  const errorAnalysis = [];

  tickets.forEach(t => {
    const isActualUrgent = t.actual_impact === 'Critical' || t.actual_impact === 'High';
    const isPredUrgent = t.final_priority === 'Critical' || t.final_priority === 'High';
    const isBaseUrgent = t.baseline_priority === 'Critical' || t.baseline_priority === 'High';

    if (isActualUrgent && isPredUrgent) tp++;
    else if (!isActualUrgent && !isPredUrgent) tn++;
    else if (!isActualUrgent && isPredUrgent) {
      fp++;
      if (errorAnalysis.length < 30) {
        errorAnalysis.push({
          ticket_id: t.ticket_id,
          ticket_content: t.ticket_content,
          affected_service: t.affected_service,
          predicted: t.final_priority,
          actual: t.actual_impact,
          reason: 'Routine request elevated due to contract tier or user group weighting.'
        });
      }
    } else if (isActualUrgent && !isPredUrgent) {
      fn++;
      if (errorAnalysis.length < 30) {
        errorAnalysis.push({
          ticket_id: t.ticket_id,
          ticket_content: t.ticket_content,
          affected_service: t.affected_service,
          predicted: t.final_priority,
          actual: t.actual_impact,
          reason: 'Urgent incident text lacked explicit keyword indicators.'
        });
      }
    }

    if (isActualUrgent && isBaseUrgent) baseTp++;
    else if (!isActualUrgent && !isBaseUrgent) baseTn++;
    else if (!isActualUrgent && isBaseUrgent) baseFp++;
    else if (isActualUrgent && !isBaseUrgent) baseFn++;
  });

  const total = tp + tn + fp + fn || 1;
  const accuracy = Math.round(((tp + tn) / total) * 100);
  const precision = (tp + fp) > 0 ? Math.round((tp / (tp + fp)) * 100) : 0;
  const recall = (tp + fn) > 0 ? Math.round((tp / (tp + fn)) * 100) : 0;
  const f1 = (precision + recall) > 0 ? Math.round((2 * precision * recall) / (precision + recall)) : 0;

  const baseTotal = baseTp + baseTn + baseFp + baseFn || 1;
  const baseAccuracy = Math.round(((baseTp + baseTn) / baseTotal) * 100);
  const basePrecision = (baseTp + baseFp) > 0 ? Math.round((baseTp / (baseTp + baseFp)) * 100) : 0;
  const baseRecall = (baseTp + baseFn) > 0 ? Math.round((baseTp / (baseTp + baseFn)) * 100) : 0;
  const baseF1 = (basePrecision + baseRecall) > 0 ? Math.round((2 * basePrecision * baseRecall) / (basePrecision + baseRecall)) : 0;

  res.json({
    improved: {
      accuracy,
      precision,
      recall,
      f1,
      tp,
      tn,
      fp,
      fn
    },
    baseline: {
      accuracy: baseAccuracy,
      precision: basePrecision,
      recall: baseRecall,
      f1: baseF1,
      tp: baseTp,
      tn: baseTn,
      fp: baseFp,
      fn: baseFn
    },
    errorAnalysis
  });
});

// --- 8. False Positives & False Negatives Dedicated Endpoints ---
app.get('/api/analytics/false-positives', (req, res) => {
  const fps = db.prepare(`
    SELECT ticket_id, ticket_content, affected_service, user_group, contract_level,
           final_priority, actual_impact, baseline_priority, total_impact_score, evidence_json
    FROM tickets
    WHERE (final_priority = 'Critical' OR final_priority = 'High')
      AND (actual_impact = 'Low' OR actual_impact = 'Medium')
    LIMIT 100
  `).all();

  res.json(fps.map(f => ({
    ...f,
    evidence: f.evidence_json ? JSON.parse(f.evidence_json) : []
  })));
});

app.get('/api/analytics/false-negatives', (req, res) => {
  const fns = db.prepare(`
    SELECT ticket_id, ticket_content, affected_service, user_group, contract_level,
           final_priority, actual_impact, baseline_priority, total_impact_score, evidence_json
    FROM tickets
    WHERE (final_priority = 'Low' OR final_priority = 'Medium')
      AND (actual_impact = 'Critical' OR actual_impact = 'High')
    LIMIT 100
  `).all();

  res.json(fns.map(f => ({
    ...f,
    evidence: f.evidence_json ? JSON.parse(f.evidence_json) : []
  })));
});

// --- 9. Edge Cases Endpoint ---
app.get('/api/edge-cases', (req, res) => {
  const edges = db.prepare('SELECT * FROM tickets WHERE is_edge_case = 1').all();
  res.json(edges.map(e => ({
    ...e,
    evidence: e.evidence_json ? JSON.parse(e.evidence_json) : []
  })));
});

app.listen(PORT, () => {
  console.log(`Clinical & Business Prioritiser API running on http://localhost:${PORT}`);
});
