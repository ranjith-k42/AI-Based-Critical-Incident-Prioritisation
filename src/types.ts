export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type ContractPriority = 'SLA Gold (24/7)' | 'SLA Silver (12/5)' | 'SLA Bronze (Standard)';

export type OperatingSchedule = '24/7 365 Days' | 'Mon-Fri 08:00-18:00' | 'Mon-Sat 06:00-22:00';

export type UserRole = 
  | 'MSP Administrator'
  | 'Customer Org Manager (Healthcare)'
  | 'Customer Org Manager (Financial)'
  | 'External Partner / Vendor L3';

export interface Ticket {
  id: string;
  organisation: string;
  organisationCategory: 'Healthcare' | 'Financial' | 'Retail' | 'Public Sector';
  contractPriority: ContractPriority;
  ticketContent: string;
  affectedService: string;
  isClinicalService: boolean;
  userGroup: string;
  isCriticalUserGroup: boolean;
  operatingSchedule: OperatingSchedule;
  incidentSeverity: 'P1 - Emergency' | 'P2 - Severe' | 'P3 - Moderate' | 'P4 - Minor';
  escalationOutcome: 'Escalated to L3' | 'Resolved in L1' | 'Pending Clinical Review' | 'Vendor Escalation';
  responseTimeMins: number; // Measured response time
  resolutionStatus: 'Open' | 'In Progress' | 'Escalated' | 'Resolved' | 'Overridden';
  
  // Baseline vs Improved outputs
  baselinePriority: PriorityLevel;
  baselineExplanation: string;
  
  improvedPriority: PriorityLevel;
  improvedExplanation: string;
  clinicalSafetyScore: number; // 0-100
  businessDisruptionScore: number; // 0-100
  operationalUrgencyScore: number; // 0-100
  compositeScore: number; // 0-100
  signalsDetected: string[];
  
  // Dynamic override state
  finalPriority: PriorityLevel;
  isOverridden: boolean;
  overrideHistory?: AuditEntry[];
  
  // Metadata
  timestamp: string; // ISO string
  isEdgeCase?: boolean;
  edgeCaseCategory?: string;
}

export interface AuditEntry {
  id: string;
  ticketId: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  organisation: string;
  originalPriority: PriorityLevel;
  updatedPriority: PriorityLevel;
  reason: string;
}

export interface EvaluationMetric {
  targetResponseMins: number;
  baselineMetSLA: boolean;
  improvedMetSLA: boolean;
  baselineIsFalsePositive: boolean;
  baselineIsFalseNegative: boolean;
  improvedIsFalsePositive: boolean;
  improvedIsFalseNegative: boolean;
}

export interface EdgeCaseScenario {
  id: string;
  title: string;
  category: 'Vague Clinical Wording' | 'False Alarm Keyword' | 'Out-of-Hours Critical Service' | 'VIP Non-Urgent Request';
  description: string;
  ticket: Ticket;
  baselineOutcome: string;
  improvedOutcome: string;
  whyImprovedSucceeds: string;
}
