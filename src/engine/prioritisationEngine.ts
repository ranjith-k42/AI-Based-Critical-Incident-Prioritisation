import { Ticket, PriorityLevel } from '../types';

export function evaluateBaselinePriority(ticket: Partial<Ticket>): {
  priority: PriorityLevel;
  explanation: string;
} {
  const content = (ticket.ticketContent || '').toLowerCase();
  const contract = ticket.contractPriority || 'SLA Bronze (Standard)';
  const service = (ticket.affectedService || '').toLowerCase();
  const severity = ticket.incidentSeverity || 'P3 - Moderate';

  let score = 0;
  const reasons: string[] = [];

  // Keyword Matching (Simplistic)
  const keywords = ['crash', 'urgent', 'down', 'emergency', 'outage', 'failure', 'error', 'severe', 'frozen'];
  let keywordMatches = 0;
  keywords.forEach(kw => {
    if (content.includes(kw)) {
      keywordMatches++;
    }
  });

  if (keywordMatches > 0) {
    score += keywordMatches * 2;
    reasons.push(`Matched ${keywordMatches} high-urgency keyword(s)`);
  }

  // Static Contract Tier Rule
  if (contract.includes('Gold')) {
    score += 4;
    reasons.push('Contract SLA Gold (+4)');
  } else if (contract.includes('Silver')) {
    score += 2;
    reasons.push('Contract SLA Silver (+2)');
  }

  // Incident Severity Rule
  if (severity.startsWith('P1')) {
    score += 5;
    reasons.push('Declared Severity P1 (+5)');
  } else if (severity.startsWith('P2')) {
    score += 3;
    reasons.push('Declared Severity P2 (+3)');
  }

  // User Group Rule
  if (ticket.isCriticalUserGroup) {
    score += 3;
    reasons.push('Critical User Group (+3)');
  }

  // Baseline Classification
  let priority: PriorityLevel = 'Low';
  if (score >= 9) {
    priority = 'Critical';
  } else if (score >= 6) {
    priority = 'High';
  } else if (score >= 3) {
    priority = 'Medium';
  } else {
    priority = 'Low';
  }

  const explanation = `Baseline rule engine assigned [${priority}] based on: ${reasons.join(', ') || 'Standard request'}. Score: ${score}.`;

  return { priority, explanation };
}

export function evaluateImprovedPriority(ticket: Partial<Ticket>): {
  priority: PriorityLevel;
  explanation: string;
  clinicalSafetyScore: number;
  businessDisruptionScore: number;
  operationalUrgencyScore: number;
  compositeScore: number;
  signalsDetected: string[];
} {
  const content = (ticket.ticketContent || '').toLowerCase();
  const orgCat = ticket.organisationCategory || 'Financial';
  const service = (ticket.affectedService || '').toLowerCase();
  const userGroup = (ticket.userGroup || '').toLowerCase();
  const schedule = ticket.operatingSchedule || 'Mon-Fri 08:00-18:00';
  const signals: string[] = [];

  // --- 1. Clinical Safety Risk Score (0-100) ---
  let clinicalScore = 0;

  // Clinical terms & context
  const clinicalKeywords = [
    'icu', 'infusion', 'medication', 'patient', 'doctor', 'nurse', 'ehr', 'emr',
    'vital', 'surgery', 'operating theatre', 'triage', 'emergency department',
    'blood bank', 'radiology', 'prescription', 'cardiac', 'monitor freeze'
  ];

  let clinicalMatches = 0;
  clinicalKeywords.forEach(term => {
    if (content.includes(term)) clinicalMatches++;
  });

  if (ticket.isClinicalService || orgCat === 'Healthcare') {
    clinicalScore += 25;
    signals.push('Clinical Environment Context (+25)');
  }

  if (clinicalMatches > 0) {
    const termPts = Math.min(clinicalMatches * 18, 50);
    clinicalScore += termPts;
    signals.push(`Clinical Terms Detected [${clinicalMatches}] (+${termPts})`);
  }

  if (userGroup.includes('doctor') || userGroup.includes('nurse') || userGroup.includes('icu') || userGroup.includes('surgeon')) {
    clinicalScore += 25;
    signals.push('Direct Care Provider User Group (+25)');
  }

  // --- 2. Business Disruption Score (0-100) ---
  let businessScore = 0;

  const businessKeywords = [
    'trading', 'revenue', 'payment', 'pos', 'checkout', 'billing', 'database',
    'core banking', 'multi-branch', 'all users', 'corporate network', 'datacenter'
  ];

  let bizMatches = 0;
  businessKeywords.forEach(term => {
    if (content.includes(term)) bizMatches++;
  });

  if (bizMatches > 0) {
    const bizPts = Math.min(bizMatches * 20, 50);
    businessScore += bizPts;
    signals.push(`Business Disruption Keywords [${bizMatches}] (+${bizPts})`);
  }

  if (service.includes('trading') || service.includes('pos') || service.includes('core') || service.includes('ehr')) {
    businessScore += 30;
    signals.push('Tier 1 Core Service Impacted (+30)');
  }

  if (ticket.isCriticalUserGroup) {
    businessScore += 20;
    signals.push('High Business Impact User Group (+20)');
  }

  // --- 3. Operational Context & Urgency Score (0-100) ---
  let operationalUrgency = 50; // Default baseline

  if (schedule.includes('24/7')) {
    operationalUrgency += 30;
    signals.push('24/7 Operating Schedule Context (+30)');
  } else {
    signals.push('Standard Business Operating Schedule (+0)');
  }

  // Non-urgent context modifiers (False alarm suppressors)
  const nonUrgentModifiers = ['training', 'staging', 'test environment', 'fire drill', 'demo', 'sandbox', 'password reset', 'routine question'];
  let nonUrgentDetected = false;
  nonUrgentModifiers.forEach(mod => {
    if (content.includes(mod)) {
      nonUrgentDetected = true;
    }
  });

  if (nonUrgentDetected) {
    clinicalScore = Math.max(0, clinicalScore - 60);
    businessScore = Math.max(0, businessScore - 60);
    operationalUrgency = Math.max(10, operationalUrgency - 50);
    signals.push('SUPPRESSOR: Test/Staging/Routine Context Detected (-60 Risk)');
  }

  // Vague wording clinical boost (Implicit urgency detection)
  if (orgCat === 'Healthcare' && (content.includes('freeze') || content.includes('intermittent') || content.includes('unable to load')) && (content.includes('ward') || content.includes('dose') || content.includes('station'))) {
    clinicalScore = Math.max(clinicalScore, 85);
    signals.push('NLP CONTEXT: Implicit Clinical Patient Workflow Disruption (+85 Clinical Risk)');
  }

  // Out of hours escalation boost
  if (schedule.includes('24/7') && (service.includes('ehr') || service.includes('replication') || service.includes('database'))) {
    operationalUrgency = Math.min(100, operationalUrgency + 20);
    signals.push('OUT-OF-HOURS: Critical 24/7 Infrastructure Escalation (+20 Urgency)');
  }

  // Clamp 0-100
  clinicalScore = Math.min(100, Math.max(0, clinicalScore));
  businessScore = Math.min(100, Math.max(0, businessScore));
  operationalUrgency = Math.min(100, Math.max(0, operationalUrgency));

  // Weighted Composite Calculation
  let compositeScore = Math.round(
    (clinicalScore * 0.45) + (businessScore * 0.35) + (operationalUrgency * 0.20)
  );

  // Force Critical if Clinical Risk is severe regardless of business score
  if (clinicalScore >= 80) {
    compositeScore = Math.max(compositeScore, 82);
  }

  // Dynamic Priority Mapping
  let priority: PriorityLevel = 'Low';
  if (compositeScore >= 75) {
    priority = 'Critical';
  } else if (compositeScore >= 55) {
    priority = 'High';
  } else if (compositeScore >= 30) {
    priority = 'Medium';
  } else {
    priority = 'Low';
  }

  const explanation = `Improved AI model classified ticket as [${priority.toUpperCase()}] (Composite Risk Score: ${compositeScore}/100). Clinical Safety: ${clinicalScore}/100, Business Disruption: ${businessScore}/100, Operational Urgency: ${operationalUrgency}/100. Primary Signals: ${signals.slice(0, 3).join(' | ')}.`;

  return {
    priority,
    explanation,
    clinicalSafetyScore: clinicalScore,
    businessDisruptionScore: businessScore,
    operationalUrgencyScore: operationalUrgency,
    compositeScore,
    signalsDetected: signals
  };
}

export function calculateTargetSLA(priority: PriorityLevel): number {
  switch (priority) {
    case 'Critical': return 15; // 15 mins target
    case 'High': return 60; // 60 mins target
    case 'Medium': return 240; // 4 hours
    case 'Low': return 1440; // 24 hours
  }
}
