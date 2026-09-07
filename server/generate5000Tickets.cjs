const db = require('./db.cjs');
const { evaluateBaseline, evaluateImproved } = require('./scoringEngine.cjs');

function generate5000Tickets() {
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM tickets');
  const currentCount = countStmt.get().count;

  if (currentCount >= 5000) {
    console.log(`Database already contains ${currentCount} tickets. Skipping generation.`);
    return;
  }

  console.log('Generating 5,000 realistic synthetic MSP support tickets...');

  const orgs = [
    { id: 'ORG-01', name: 'CityCare Hospital', contract: 'Platinum', schedule: '24/7', target: 15 },
    { id: 'ORG-02', name: 'Metro Health Clinic', contract: 'Gold', schedule: 'Extended Hours', target: 30 },
    { id: 'ORG-03', name: 'MedTech Partner Services', contract: 'Gold', schedule: '24/7', target: 30 },
    { id: 'ORG-04', name: 'Retail Business Services', contract: 'Standard', schedule: 'Business Hours', target: 60 },
  ];

  const clinicalServices = [
    { service: 'Electronic Health Record', category: 'Clinical Core', phrases: [
      'unable to treat patients as charts fail to load',
      'clinical notes saving timeout during triage',
      'order entry latency in acute care',
      'intermittent session drop during consultation'
    ]},
    { service: 'Emergency Department System', category: 'Clinical Core', phrases: [
      'emergency department unavailable for triage and bed allocation',
      'ambulance incoming notification delayed',
      'ED tracking board freezing continuously',
      'patient admission queue stalled in emergency'
    ]},
    { service: 'Medication Management', category: 'Clinical Medication', phrases: [
      'medication system unavailable for dispensing antibiotics',
      'bar-code drug administration scanner sync failure',
      'pharmacy refill verification backlog',
      'infusion pump dose protocol sync warning'
    ]},
    { service: 'Patient Portal', category: 'Patient Facing', phrases: [
      'patients cannot access lab results and test records',
      'online appointment booking throwing error 500',
      'patient message inbox notification delayed',
      'portal login MFA token failure for outpatients'
    ]},
    { service: 'Appointment System', category: 'Patient Facing', phrases: [
      'clinic appointment booking calendar locked',
      'outpatient rescheduling tool sluggish',
      'appointment confirmation SMS gateway queue backlog'
    ]}
  ];

  const businessServices = [
    { service: 'Payment System', category: 'Financial Business', phrases: [
      'payment system complete outage across POS terminals',
      'credit card transaction gateway authorization timeout',
      'billing settlement reconciliation failed at cutoff',
      'merchant portal reporting batch error'
    ]},
    { service: 'Payroll', category: 'Corporate Enterprise', phrases: [
      'payroll processing blocked before monthly cutoff',
      'direct deposit transmission batch failure',
      'timesheet approval calculation error for branch staff'
    ]},
    { service: 'Authentication Service', category: 'Identity & Access', phrases: [
      'authentication service failure affecting all staff sign-in',
      'Single Sign-On SSO token expiration loop',
      'Active directory sync delay between campuses',
      'password reset self-service page unavailable'
    ]},
    { service: 'Network', category: 'Infrastructure', phrases: [
      'core switch offline in surgical wing',
      'datacenter fiber link packet drop',
      'wireless access point intermittent in ward 4',
      'VPN gateway capacity saturated for remote staff'
    ]}
  ];

  const routineServices = [
    { service: 'Printing', category: 'Office Support', phrases: [
      'printer issue on floor 2 paper tray jam',
      'label printer calibration off for badge printing',
      'toner replacement required for reception printer',
      'network printer offline after power restart'
    ]},
    { service: 'Email', category: 'Office Support', phrases: [
      'outlook calendar sync delay on mobile device',
      'shared mailbox delegate permissions request',
      'email delivery bounce back from external supplier',
      'mailbox storage quota warning message'
    ]},
    { service: 'Other', category: 'General Support', phrases: [
      'software installation request for statistical tool',
      'dual monitor stand request for office desk',
      'mouse cursor lag on workstation',
      'headset audio crackling during web conference',
      'excel macro runtime warning in finance team'
    ]}
  ];

  const userGroups = [
    'Emergency Clinical Staff',
    'Doctors',
    'Nurses',
    'Administrative Staff',
    'IT Support',
    'External Partner',
    'Customers'
  ];

  const statuses = ['Open', 'In Progress', 'Escalated', 'Resolved'];

  const insertTicket = db.prepare(`
    INSERT INTO tickets (
      ticket_id, organisation_id, organisation_name, contract_level, created_date_time,
      ticket_content, affected_service, service_category, user_group, number_of_affected_users,
      operating_schedule, submitted_during_operating_hours, escalation_requested, escalation_outcome,
      actual_impact, response_time_minutes, resolution_time_minutes, incident_status,
      baseline_priority, baseline_explanation, improved_priority, improved_explanation,
      clinical_score, business_score, criticality_score, users_score, schedule_score, contract_score,
      total_impact_score, evidence_json, final_priority, is_overridden, is_edge_case, edge_case_type
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, 0, ?, ?
    )
  `);

  // Explicit 3 Edge Cases required by user prompt
  const edgeCases = [
    {
      id: 'TICK-EDGE-001',
      org: orgs[0], // CityCare Hospital
      content: 'The main screen is unavailable and patients are waiting.',
      service: 'Patient Portal',
      category: 'Patient Facing',
      userGroup: 'Doctors',
      users: 140,
      duringHours: 1,
      escalation: 1,
      escalationOutcome: 'Escalated to Clinical Lead',
      actualImpact: 'Critical',
      responseTime: 12,
      resTime: 75,
      status: 'In Progress',
      edgeType: 'Urgent Incident with Vague Text'
    },
    {
      id: 'TICK-EDGE-002',
      org: orgs[3], // Retail Business Services
      content: 'This software is critical for my personal presentation.',
      service: 'Other',
      category: 'General Support',
      userGroup: 'Administrative Staff',
      users: 1,
      duringHours: 1,
      escalation: 0,
      escalationOutcome: 'Standard Queue',
      actualImpact: 'Low',
      responseTime: 140,
      resTime: 360,
      status: 'Resolved',
      edgeType: 'False Urgent Keyword'
    },
    {
      id: 'TICK-EDGE-003',
      org: orgs[0], // CityCare Hospital
      content: 'Emergency medication service unavailable.',
      service: 'Medication Management',
      category: 'Clinical Medication',
      userGroup: 'Emergency Clinical Staff',
      users: 85,
      duringHours: 0, // Outside normal business hours
      escalation: 1,
      escalationOutcome: '24/7 Duty Escalation',
      actualImpact: 'Critical',
      responseTime: 10,
      resTime: 55,
      status: 'Open',
      edgeType: 'Incident Outside Business Hours'
    }
  ];

  db.exec('BEGIN TRANSACTION;');

  // Insert explicit edge cases
  for (const ec of edgeCases) {
    const raw = {
      ticket_content: ec.content,
      affected_service: ec.service,
      service_category: ec.category,
      user_group: ec.userGroup,
      number_of_affected_users: ec.users,
      operating_schedule: ec.org.schedule,
      contract_level: ec.org.contract,
      submitted_during_operating_hours: ec.duringHours,
      escalation_requested: ec.escalation,
      escalation_outcome: ec.escalationOutcome
    };

    const base = evaluateBaseline(raw);
    const imp = evaluateImproved(raw);

    insertTicket.run(
      ec.id, ec.org.id, ec.org.name, ec.org.contract, new Date(Date.now() - 3600000 * 2).toISOString(),
      ec.content, ec.service, ec.category, ec.userGroup, ec.users,
      ec.org.schedule, ec.duringHours, ec.escalation, ec.escalationOutcome,
      ec.actualImpact, ec.responseTime, ec.resTime, ec.status,
      base.priority, base.explanation, imp.priority, imp.explanation,
      imp.clinicalScore, imp.businessScore, imp.criticalityScore, imp.usersScore, imp.scheduleScore, imp.contractScore,
      imp.totalImpactScore, JSON.stringify(imp.evidence), imp.priority,
      1, ec.edgeType
    );
  }

  // Generate remaining tickets to make exactly 5,000
  const totalToGenerate = 5000 - edgeCases.length;

  for (let i = 1; i <= totalToGenerate; i++) {
    const ticketId = `TICK-${String(i).padStart(5, '0')}`;
    
    // Distribute across organizations
    const org = orgs[i % orgs.length];

    // Priority Distribution:
    // Realistic imbalance:
    // ~6% Critical (300 tickets)
    // ~20% High (1,000 tickets)
    // ~44% Medium (2,200 tickets)
    // ~30% Low (1,500 tickets)
    const roll = Math.random();
    let targetTier = 'Low';
    if (roll < 0.06) {
      targetTier = 'Critical';
    } else if (roll < 0.26) {
      targetTier = 'High';
    } else if (roll < 0.70) {
      targetTier = 'Medium';
    } else {
      targetTier = 'Low';
    }

    let svcObj;
    let userGroup;
    let usersAffected;
    let duringHours = Math.random() > 0.15 ? 1 : 0;
    let escalation = 0;
    let escalationOutcome = 'Resolved in L1';
    let actualImpact = targetTier;

    if (targetTier === 'Critical') {
      if (org.id === 'ORG-01' || org.id === 'ORG-02') {
        svcObj = clinicalServices[Math.floor(Math.random() * 3)];
        userGroup = Math.random() > 0.5 ? 'Emergency Clinical Staff' : 'Doctors';
      } else {
        svcObj = businessServices[0]; // Payment System
        userGroup = 'Customers';
      }
      usersAffected = Math.floor(60 + Math.random() * 350);
      escalation = 1;
      escalationOutcome = 'Escalated to Tier-3 Specialist';
    } else if (targetTier === 'High') {
      if (org.id === 'ORG-01' || org.id === 'ORG-02') {
        svcObj = clinicalServices[Math.floor(Math.random() * clinicalServices.length)];
        userGroup = Math.random() > 0.5 ? 'Nurses' : 'Doctors';
      } else {
        svcObj = businessServices[Math.floor(Math.random() * businessServices.length)];
        userGroup = 'Administrative Staff';
      }
      usersAffected = Math.floor(25 + Math.random() * 90);
      escalation = Math.random() > 0.4 ? 1 : 0;
      escalationOutcome = escalation ? 'Escalated to Tier-2 Support' : 'Resolved in L1';
    } else if (targetTier === 'Medium') {
      const allSvc = [...clinicalServices.slice(3), ...businessServices.slice(1), ...routineServices];
      svcObj = allSvc[Math.floor(Math.random() * allSvc.length)];
      userGroup = userGroups[Math.floor(Math.random() * userGroups.length)];
      usersAffected = Math.floor(4 + Math.random() * 20);
      escalation = 0;
      escalationOutcome = 'Standard Queue L1';
    } else {
      // Low
      svcObj = routineServices[Math.floor(Math.random() * routineServices.length)];
      userGroup = 'Administrative Staff';
      usersAffected = Math.floor(1 + Math.random() * 3);
      escalation = 0;
      escalationOutcome = 'Resolved in L1';
    }

    const phrase = svcObj.phrases[Math.floor(Math.random() * svcObj.phrases.length)];
    const ticketContent = phrase.charAt(0).toUpperCase() + phrase.slice(1) + '.';

    const raw = {
      ticket_content: ticketContent,
      affected_service: svcObj.service,
      service_category: svcObj.category,
      user_group: userGroup,
      number_of_affected_users: usersAffected,
      operating_schedule: org.schedule,
      contract_level: org.contract,
      submitted_during_operating_hours: duringHours,
      escalation_requested: escalation,
      escalation_outcome: escalationOutcome
    };

    const base = evaluateBaseline(raw);
    const imp = evaluateImproved(raw);

    // Realistic response and resolution times
    let responseTime = 5;
    if (imp.priority === 'Critical') {
      const isBreach = Math.random() < 0.04;
      responseTime = isBreach ? org.target + Math.floor(Math.random() * 20) : Math.floor(4 + Math.random() * (org.target - 4));
    } else if (imp.priority === 'High') {
      responseTime = Math.floor(15 + Math.random() * 50);
    } else if (imp.priority === 'Medium') {
      responseTime = Math.floor(45 + Math.random() * 180);
    } else {
      responseTime = Math.floor(90 + Math.random() * 600);
    }

    const resolutionTime = responseTime + Math.floor(30 + Math.random() * 300);
    const incidentStatus = statuses[Math.floor(Math.random() * statuses.length)];

    const daysAgo = Math.floor(Math.random() * 90);
    const hoursAgo = Math.floor(Math.random() * 24);
    const createdDate = new Date(Date.now() - (daysAgo * 86400000 + hoursAgo * 3600000)).toISOString();

    insertTicket.run(
      ticketId, org.id, org.name, org.contract, createdDate,
      ticketContent, svcObj.service, svcObj.category, userGroup, usersAffected,
      org.schedule, duringHours, escalation, escalationOutcome,
      actualImpact, responseTime, resolutionTime, incidentStatus,
      base.priority, base.explanation, imp.priority, imp.explanation,
      imp.clinicalScore, imp.businessScore, imp.criticalityScore, imp.usersScore, imp.scheduleScore, imp.contractScore,
      imp.totalImpactScore, JSON.stringify(imp.evidence), imp.priority,
      0, null
    );
  }

  db.exec('COMMIT;');
  console.log(`Successfully generated and stored 5,000 synthetic tickets in SQLite!`);
}

module.exports = { generate5000Tickets };

if (require.main === module) {
  generate5000Tickets();
}
