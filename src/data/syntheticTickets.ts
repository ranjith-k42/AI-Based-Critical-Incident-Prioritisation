import { Ticket, AuditEntry } from '../types';
import { evaluateBaselinePriority, evaluateImprovedPriority } from '../engine/prioritisationEngine';

const initialRawTickets: Array<Omit<Ticket, 'baselinePriority' | 'baselineExplanation' | 'improvedPriority' | 'improvedExplanation' | 'clinicalSafetyScore' | 'businessDisruptionScore' | 'operationalUrgencyScore' | 'compositeScore' | 'signalsDetected' | 'finalPriority' | 'isOverridden'>> = [
  // --- Edge Case 1: Urgent Clinical Incident Hidden by Vague Wording ---
  {
    id: 'TICK-9001',
    organisation: 'St. Jude Regional Health',
    organisationCategory: 'Healthcare',
    contractPriority: 'SLA Gold (24/7)',
    ticketContent: 'Station 4 tablet screens keep freezing intermittently when staff tap to confirm dose delivery during medication administration rounds in Ward 3.',
    affectedService: 'EHR Infusion & Medication Dispenser Sync',
    isClinicalService: true,
    userGroup: 'ICU & Ward 3 Clinical Nurses',
    isCriticalUserGroup: true,
    operatingSchedule: '24/7 365 Days',
    incidentSeverity: 'P3 - Moderate',
    escalationOutcome: 'Escalated to L3',
    responseTimeMins: 12,
    resolutionStatus: 'Open',
    timestamp: '2026-09-07T03:15:00Z',
    isEdgeCase: true,
    edgeCaseCategory: 'Vague Clinical Wording'
  },
  
  // --- Edge Case 2: High-Severity Keyword in Non-Urgent Context ---
  {
    id: 'TICK-9002',
    organisation: 'FinCorp Global Banking',
    organisationCategory: 'Financial',
    contractPriority: 'SLA Gold (24/7)',
    ticketContent: 'Emergency disaster recovery fire drill test failed during scheduled training run in staging sandbox environment.',
    affectedService: 'Staging Disaster Recovery Sandbox',
    isClinicalService: false,
    userGroup: 'IT Trainees & Support Crew',
    isCriticalUserGroup: false,
    operatingSchedule: 'Mon-Fri 08:00-18:00',
    incidentSeverity: 'P1 - Emergency',
    escalationOutcome: 'Resolved in L1',
    responseTimeMins: 450,
    resolutionStatus: 'Resolved',
    timestamp: '2026-09-06T14:20:00Z',
    isEdgeCase: true,
    edgeCaseCategory: 'False Alarm Keyword'
  },

  // --- Edge Case 3: Out-of-Hours Critical Service Failure ---
  {
    id: 'TICK-9003',
    organisation: 'NHS East Trust',
    organisationCategory: 'Healthcare',
    contractPriority: 'SLA Gold (24/7)',
    ticketContent: 'EHR database standby replication failed completely at 02:15 AM on Sunday morning, leaving central hospital repository without hot backup.',
    affectedService: 'EHR Core Database Replication',
    isClinicalService: true,
    userGroup: 'On-Call Emergency IT Specialists',
    isCriticalUserGroup: true,
    operatingSchedule: '24/7 365 Days',
    incidentSeverity: 'P2 - Severe',
    escalationOutcome: 'Escalated to L3',
    responseTimeMins: 14,
    resolutionStatus: 'In Progress',
    timestamp: '2026-09-07T02:15:00Z',
    isEdgeCase: true,
    edgeCaseCategory: 'Out-of-Hours Critical Service'
  },

  // --- Edge Case 4: VIP Non-Urgent Password Reset Request ---
  {
    id: 'TICK-9004',
    organisation: 'OmniRetail Holdings',
    organisationCategory: 'Retail',
    contractPriority: 'SLA Gold (24/7)',
    ticketContent: 'Executive Vice President password reset request for secondary email account prior to annual conference next month.',
    affectedService: 'Active Directory / Identity Management',
    isClinicalService: false,
    userGroup: 'Executive Leadership Team',
    isCriticalUserGroup: true,
    operatingSchedule: 'Mon-Fri 08:00-18:00',
    incidentSeverity: 'P4 - Minor',
    escalationOutcome: 'Resolved in L1',
    responseTimeMins: 180,
    resolutionStatus: 'Resolved',
    timestamp: '2026-09-06T11:00:00Z',
    isEdgeCase: true,
    edgeCaseCategory: 'VIP Non-Urgent Request'
  },

  // --- Standard Healthcare Tickets ---
  {
    id: 'TICK-1005',
    organisation: 'St. Jude Regional Health',
    organisationCategory: 'Healthcare',
    contractPriority: 'SLA Gold (24/7)',
    ticketContent: 'Emergency Department cardiac telemetry network dropping packets continuously; central monitor alarm delayed.',
    affectedService: 'Cardiac Telemetry Gateway',
    isClinicalService: true,
    userGroup: 'ED Attending Physicians & Nurses',
    isCriticalUserGroup: true,
    operatingSchedule: '24/7 365 Days',
    incidentSeverity: 'P1 - Emergency',
    escalationOutcome: 'Escalated to L3',
    responseTimeMins: 8,
    resolutionStatus: 'In Progress',
    timestamp: '2026-09-07T09:40:00Z'
  },
  {
    id: 'TICK-1006',
    organisation: 'NHS East Trust',
    organisationCategory: 'Healthcare',
    contractPriority: 'SLA Silver (12/5)',
    ticketContent: 'Radiology PACS image archiver slow loading for non-urgent outpatient X-ray reviews.',
    affectedService: 'Radiology PACS Archiver',
    isClinicalService: true,
    userGroup: 'Radiology Technicians',
    isCriticalUserGroup: false,
    operatingSchedule: 'Mon-Fri 08:00-18:00',
    incidentSeverity: 'P3 - Moderate',
    escalationOutcome: 'Resolved in L1',
    responseTimeMins: 110,
    resolutionStatus: 'Open',
    timestamp: '2026-09-07T08:30:00Z'
  },
  {
    id: 'TICK-1007',
    organisation: 'Metro City Health',
    organisationCategory: 'Public Sector',
    contractPriority: 'SLA Bronze (Standard)',
    ticketContent: 'Community health portal clinic appointment booking form submit button unresponsive.',
    affectedService: 'Public Health Booking Portal',
    isClinicalService: false,
    userGroup: 'Public / Outpatient Reception',
    isCriticalUserGroup: false,
    operatingSchedule: 'Mon-Sat 06:00-22:00',
    incidentSeverity: 'P3 - Moderate',
    escalationOutcome: 'Resolved in L1',
    responseTimeMins: 220,
    resolutionStatus: 'In Progress',
    timestamp: '2026-09-07T07:15:00Z'
  },

  // --- Financial Services Tickets ---
  {
    id: 'TICK-2001',
    organisation: 'FinCorp Global Banking',
    organisationCategory: 'Financial',
    contractPriority: 'SLA Gold (24/7)',
    ticketContent: 'High-frequency algorithmic trading API gateway latency increased by 450ms, causing trade execution timeouts on NYSE desk.',
    affectedService: 'FX & Equity Trading Gateway',
    isClinicalService: false,
    userGroup: 'Institutional Traders & Risk Desk',
    isCriticalUserGroup: true,
    operatingSchedule: '24/7 365 Days',
    incidentSeverity: 'P1 - Emergency',
    escalationOutcome: 'Escalated to L3',
    responseTimeMins: 10,
    resolutionStatus: 'In Progress',
    timestamp: '2026-09-07T10:05:00Z'
  },
  {
    id: 'TICK-2002',
    organisation: 'FinCorp Global Banking',
    organisationCategory: 'Financial',
    contractPriority: 'SLA Silver (12/5)',
    ticketContent: 'Quarterly compliance audit report generator throwing memory overflow error on historical 2024 records.',
    affectedService: 'Regulatory Reporting Engine',
    isClinicalService: false,
    userGroup: 'Compliance Analysts',
    isCriticalUserGroup: false,
    operatingSchedule: 'Mon-Fri 08:00-18:00',
    incidentSeverity: 'P3 - Moderate',
    escalationOutcome: 'Resolved in L1',
    responseTimeMins: 145,
    resolutionStatus: 'Open',
    timestamp: '2026-09-07T06:50:00Z'
  },

  // --- Retail Services Tickets ---
  {
    id: 'TICK-3001',
    organisation: 'OmniRetail Holdings',
    organisationCategory: 'Retail',
    contractPriority: 'SLA Gold (24/7)',
    ticketContent: 'Point-of-Sale (POS) credit card payment processing down across 42 flagship retail locations nationwide.',
    affectedService: 'Payment Processing Gateway & POS',
    isClinicalService: false,
    userGroup: 'Store Managers & Cashiers',
    isCriticalUserGroup: true,
    operatingSchedule: 'Mon-Sat 06:00-22:00',
    incidentSeverity: 'P1 - Emergency',
    escalationOutcome: 'Vendor Escalation',
    responseTimeMins: 15,
    resolutionStatus: 'Escalated',
    timestamp: '2026-09-07T10:30:00Z'
  },
  {
    id: 'TICK-3002',
    organisation: 'OmniRetail Holdings',
    organisationCategory: 'Retail',
    contractPriority: 'SLA Bronze (Standard)',
    ticketContent: 'Intranet employee shift scheduling calendar color coding missing for part-time warehouse staff.',
    affectedService: 'Staff Workforce Portal',
    isClinicalService: false,
    userGroup: 'Warehouse Staff',
    isCriticalUserGroup: false,
    operatingSchedule: 'Mon-Fri 08:00-18:00',
    incidentSeverity: 'P4 - Minor',
    escalationOutcome: 'Resolved in L1',
    responseTimeMins: 520,
    resolutionStatus: 'Resolved',
    timestamp: '2026-09-06T15:10:00Z'
  },

  // --- Additional General & Edge Tickets ---
  {
    id: 'TICK-4001',
    organisation: 'St. Jude Regional Health',
    organisationCategory: 'Healthcare',
    contractPriority: 'SLA Gold (24/7)',
    ticketContent: 'Operating Suite 2 anesthesia workstation monitor screen backlight flickering during pre-op preparation.',
    affectedService: 'Surgical Workstation Systems',
    isClinicalService: true,
    userGroup: 'Anesthesiologists & Surgical Staff',
    isCriticalUserGroup: true,
    operatingSchedule: '24/7 365 Days',
    incidentSeverity: 'P2 - Severe',
    escalationOutcome: 'Escalated to L3',
    responseTimeMins: 11,
    resolutionStatus: 'In Progress',
    timestamp: '2026-09-07T08:00:00Z'
  },
  {
    id: 'TICK-4002',
    organisation: 'Metro City Health',
    organisationCategory: 'Public Sector',
    contractPriority: 'SLA Silver (12/5)',
    ticketContent: 'Request for secondary monitor arm installation in administrative billing department.',
    affectedService: 'IT Desktop Support',
    isClinicalService: false,
    userGroup: 'Administrative Staff',
    isCriticalUserGroup: false,
    operatingSchedule: 'Mon-Fri 08:00-18:00',
    incidentSeverity: 'P4 - Minor',
    escalationOutcome: 'Resolved in L1',
    responseTimeMins: 890,
    resolutionStatus: 'Resolved',
    timestamp: '2026-09-05T09:00:00Z'
  },
  {
    id: 'TICK-4003',
    organisation: 'FinCorp Global Banking',
    organisationCategory: 'Financial',
    contractPriority: 'SLA Gold (24/7)',
    ticketContent: 'SWIFT international wire transfer reconciliation service stalled with error 503 Service Unavailable.',
    affectedService: 'SWIFT Payment Rail Integration',
    isClinicalService: false,
    userGroup: 'Treasury & Settlement Team',
    isCriticalUserGroup: true,
    operatingSchedule: '24/7 365 Days',
    incidentSeverity: 'P1 - Emergency',
    escalationOutcome: 'Escalated to L3',
    responseTimeMins: 14,
    resolutionStatus: 'Open',
    timestamp: '2026-09-07T11:10:00Z'
  }
];

export function generateSyntheticTickets(): Ticket[] {
  return initialRawTickets.map(raw => {
    const baseline = evaluateBaselinePriority(raw);
    const improved = evaluateImprovedPriority(raw);

    return {
      ...raw,
      baselinePriority: baseline.priority,
      baselineExplanation: baseline.explanation,
      improvedPriority: improved.priority,
      improvedExplanation: improved.explanation,
      clinicalSafetyScore: improved.clinicalSafetyScore,
      businessDisruptionScore: improved.businessDisruptionScore,
      operationalUrgencyScore: improved.operationalUrgencyScore,
      compositeScore: improved.compositeScore,
      signalsDetected: improved.signalsDetected,
      finalPriority: improved.priority,
      isOverridden: false,
      overrideHistory: []
    };
  });
}

export const initialAuditTrail: AuditEntry[] = [
  {
    id: 'AUD-001',
    ticketId: 'TICK-9001',
    timestamp: '2026-09-07T03:30:00Z',
    userName: 'Dr. Sarah Jenkins',
    userRole: 'Customer Org Manager (Healthcare)',
    organisation: 'St. Jude Regional Health',
    originalPriority: 'Medium',
    updatedPriority: 'Critical',
    reason: 'Vague ticket content was identified by nursing supervisor as actively affecting Ward 3 medication delivery pumps during early morning rounds.'
  },
  {
    id: 'AUD-002',
    ticketId: 'TICK-9002',
    timestamp: '2026-09-06T15:00:00Z',
    userName: 'Mark Vance',
    userRole: 'MSP Administrator',
    organisation: 'FinCorp Global Banking',
    originalPriority: 'Critical',
    updatedPriority: 'Low',
    reason: 'Confirmed ticket originated from isolated staging environment during planned fire drill training.'
  }
];
