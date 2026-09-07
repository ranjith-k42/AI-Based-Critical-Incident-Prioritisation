// Scoring Engine for Clinical & Business Impact Prioritiser

function evaluateBaseline(ticket) {
  const content = (ticket.ticket_content || '').toLowerCase();
  const service = (ticket.affected_service || '').toLowerCase();
  const userGroup = (ticket.user_group || '').toLowerCase();
  const users = Number(ticket.number_of_affected_users || 1);
  const escalation = ticket.escalation_requested === 1 || ticket.escalation_requested === true;

  // Rules for Baseline:
  // Critical: Patient-facing service unavailable, Emergency service affected, Medication system unavailable, >100 users affected, Complete service outage
  const isEmergencyService = service.includes('emergency') || service.includes('medication') || service.includes('ehr') || service.includes('electronic health');
  const isPatientFacing = service.includes('patient') || service.includes('portal') || content.includes('patient');
  const hasOutageKeyword = content.includes('down') || content.includes('outage') || content.includes('failure') || content.includes('unavailable') || content.includes('crash');

  if ((isEmergencyService || isPatientFacing) && hasOutageKeyword) {
    return {
      priority: 'Critical',
      explanation: 'Baseline Rule: Emergency or Patient-facing service outage keyword matched.'
    };
  }

  if (users > 100 && hasOutageKeyword) {
    return {
      priority: 'Critical',
      explanation: 'Baseline Rule: Over 100 users affected with outage keyword.'
    };
  }

  // High: Important service degraded, Large dept affected, Multiple clinical users, Escalation requested
  const isClinicalStaff = userGroup.includes('doctor') || userGroup.includes('nurse') || userGroup.includes('clinical');
  if (isClinicalStaff || escalation || users > 30) {
    return {
      priority: 'High',
      explanation: 'Baseline Rule: Clinical staff impact, escalation requested, or >30 users affected.'
    };
  }

  // Medium: Individual department problem, Multiple non-critical users
  if (users > 5) {
    return {
      priority: 'Medium',
      explanation: 'Baseline Rule: Departmental impact affecting multiple users.'
    };
  }

  // Low: Password reset, printer, single user
  return {
    priority: 'Low',
    explanation: 'Baseline Rule: Routine individual user support request.'
  };
}

function evaluateImproved(ticket, config) {
  const cfg = config || {
    weight_clinical: 30,
    weight_business: 25,
    weight_criticality: 20,
    weight_users: 10,
    weight_schedule: 10,
    weight_contract: 5,
    threshold_critical: 80,
    threshold_high: 60,
    threshold_medium: 30
  };

  const content = (ticket.ticket_content || '').toLowerCase();
  const service = (ticket.affected_service || '').toLowerCase();
  const category = (ticket.service_category || '').toLowerCase();
  const userGroup = (ticket.user_group || '').toLowerCase();
  const users = Number(ticket.number_of_affected_users || 1);
  const schedule = (ticket.operating_schedule || '').toLowerCase();
  const contract = (ticket.contract_level || 'Standard').toLowerCase();
  const duringHours = ticket.submitted_during_operating_hours === 1 || ticket.submitted_during_operating_hours === true;
  const escalationOutcome = (ticket.escalation_outcome || '').toLowerCase();

  const evidence = [];

  // --- 1. Clinical Impact (0 - 30 max based on weight_clinical) ---
  let clinicalNorm = 0;
  const urgentClinicalPhrases = [
    'emergency department unavailable', 'medication system unavailable', 'patients cannot access',
    'unable to treat patients', 'patient care stopped', 'icu monitor', 'infusion pump',
    'vital signs', 'operating theatre', 'code blue', 'urgent patient'
  ];

  let matchedUrgentClinical = false;
  for (const phrase of urgentClinicalPhrases) {
    if (content.includes(phrase)) {
      matchedUrgentClinical = true;
      evidence.push(`Urgent clinical failure detected: "${phrase}"`);
      break;
    }
  }

  if (matchedUrgentClinical) {
    clinicalNorm = 1.0;
  } else if (service.includes('electronic health') || service.includes('medication') || service.includes('emergency department')) {
    clinicalNorm = 0.85;
    evidence.push(`Direct clinical system affected (${ticket.affected_service})`);
  } else if (userGroup.includes('emergency') || userGroup.includes('doctor') || userGroup.includes('nurse')) {
    clinicalNorm = 0.65;
    evidence.push(`Direct clinical healthcare providers impacted (${ticket.user_group})`);
  } else if (service.includes('patient portal') || service.includes('appointment')) {
    clinicalNorm = 0.5;
    evidence.push(`Patient-facing scheduling portal affected`);
  }

  // --- 2. Business Impact (0 - 25 max based on weight_business) ---
  let businessNorm = 0;
  const businessUrgentPhrases = [
    'complete outage', 'system down', 'all users affected', 'critical service failure',
    'payment down', 'pos failure', 'payroll blocked', 'revenue loss'
  ];

  let matchedBizPhrase = false;
  for (const phrase of businessUrgentPhrases) {
    if (content.includes(phrase)) {
      matchedBizPhrase = true;
      evidence.push(`Business disruption indicator: "${phrase}"`);
      break;
    }
  }

  if (matchedBizPhrase && (service.includes('payment') || service.includes('payroll') || service.includes('ehr'))) {
    businessNorm = 1.0;
  } else if (service.includes('payment') || service.includes('payroll') || service.includes('network')) {
    businessNorm = 0.75;
    evidence.push(`Core revenue/infrastructure service affected (${ticket.affected_service})`);
  } else if (matchedBizPhrase) {
    businessNorm = 0.6;
  } else if (users > 50) {
    businessNorm = 0.5;
    evidence.push(`Widespread user business impact`);
  }

  // --- 3. Service Criticality (0 - 20 max based on weight_criticality) ---
  let criticalityNorm = 0;
  if (category.includes('clinical') || service.includes('electronic health') || service.includes('emergency')) {
    criticalityNorm = 1.0;
    evidence.push(`Tier-1 Mission Critical Service (${ticket.affected_service})`);
  } else if (service.includes('authentication') || service.includes('payment') || service.includes('network')) {
    criticalityNorm = 0.8;
    evidence.push(`Tier-2 Essential Enterprise Service (${ticket.affected_service})`);
  } else if (service.includes('email') || service.includes('appointment') || service.includes('portal')) {
    criticalityNorm = 0.5;
  } else {
    criticalityNorm = 0.2;
  }

  // --- 4. Number of Affected Users (0 - 10 max based on weight_users) ---
  let usersNorm = 0;
  if (users >= 200) {
    usersNorm = 1.0;
    evidence.push(`Extensive scale: Approximately ${users} users impacted`);
  } else if (users >= 50) {
    usersNorm = 0.8;
    evidence.push(`Substantial scale: ${users} users impacted`);
  } else if (users >= 15) {
    usersNorm = 0.5;
    evidence.push(`Departmental scale: ${users} users impacted`);
  } else if (users >= 2) {
    usersNorm = 0.25;
  } else {
    usersNorm = 0.05;
  }

  // --- 5. Operating Schedule Impact (0 - 10 max based on weight_schedule) ---
  let scheduleNorm = 0;
  if (schedule.includes('24/7') || schedule.includes('emergency')) {
    scheduleNorm = 1.0;
    evidence.push(`24/7 Continuous Emergency operating schedule context`);
  } else if (duringHours) {
    scheduleNorm = 0.8;
    evidence.push(`Incident occurred during peak active operating hours`);
  } else {
    scheduleNorm = 0.3;
  }

  // --- 6. Contract Priority (0 - 5 max based on weight_contract) ---
  let contractNorm = 0;
  if (contract.includes('platinum')) {
    contractNorm = 1.0;
    evidence.push(`Platinum contract level with 15-minute response commitment`);
  } else if (contract.includes('gold')) {
    contractNorm = 0.7;
    evidence.push(`Gold contract level with 30-minute response commitment`);
  } else {
    contractNorm = 0.4;
    evidence.push(`Standard contract tier`);
  }

  // --- Suppressors for Routine False Alarms ---
  const routinePhrases = ['password reset', 'printer issue', 'software installation', 'access request', 'personal presentation', 'minor issue', 'test drill', 'sandbox'];
  let isRoutineFalseAlarm = false;
  for (const phrase of routinePhrases) {
    if (content.includes(phrase) && users <= 2 && !service.includes('electronic health')) {
      isRoutineFalseAlarm = true;
      evidence.push(`SUPPRESSOR: Routine non-critical task phrase detected ("${phrase}")`);
      break;
    }
  }

  if (isRoutineFalseAlarm) {
    clinicalNorm = Math.min(clinicalNorm, 0.1);
    businessNorm = Math.min(businessNorm, 0.1);
    criticalityNorm = Math.min(criticalityNorm, 0.2);
  }

  // Calculate Sub-scores
  const clinicalScore = Math.round(clinicalNorm * cfg.weight_clinical);
  const businessScore = Math.round(businessNorm * cfg.weight_business);
  const criticalityScore = Math.round(criticalityNorm * cfg.weight_criticality);
  const usersScore = Math.round(usersNorm * cfg.weight_users);
  const scheduleScore = Math.round(scheduleNorm * cfg.weight_schedule);
  const contractScore = Math.round(contractNorm * cfg.weight_contract);

  let totalScore = clinicalScore + businessScore + criticalityScore + usersScore + scheduleScore + contractScore;
  totalScore = Math.min(100, Math.max(0, totalScore));

  // Determine Priority Level
  let priority = 'Low';
  if (totalScore >= cfg.threshold_critical) {
    priority = 'Critical';
  } else if (totalScore >= cfg.threshold_high) {
    priority = 'High';
  } else if (totalScore >= cfg.threshold_medium) {
    priority = 'Medium';
  } else {
    priority = 'Low';
  }

  const explanation = `Improved Engine: Assigned [${priority.toUpperCase()}] with Impact Score ${totalScore}/100. Factors: Clinical (${clinicalScore}/${cfg.weight_clinical}), Business (${businessScore}/${cfg.weight_business}), Criticality (${criticalityScore}/${cfg.weight_criticality}), Users (${usersScore}/${cfg.weight_users}), Schedule (${scheduleScore}/${cfg.weight_schedule}), Contract (${contractScore}/${cfg.weight_contract}).`;

  return {
    priority,
    totalImpactScore: totalScore,
    clinicalScore,
    businessScore,
    criticalityScore,
    usersScore,
    scheduleScore,
    contractScore,
    explanation,
    evidence
  };
}

module.exports = {
  evaluateBaseline,
  evaluateImproved
};
