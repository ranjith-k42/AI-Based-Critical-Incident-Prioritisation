// API Client for Clinical & Business Impact Prioritiser
const API_BASE = '';

export async function fetchDashboardAnalytics() {
  const res = await fetch(`${API_BASE}/api/analytics/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
}

export async function fetchTickets(params: Record<string, any> = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/tickets?${query}`);
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
}

export async function fetchTicketById(id: string) {
  const res = await fetch(`${API_BASE}/api/tickets/${id}`);
  if (!res.ok) throw new Error('Failed to fetch ticket');
  return res.json();
}

export async function createTicket(ticketData: Record<string, any>) {
  const res = await fetch(`${API_BASE}/api/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData)
  });
  if (!res.ok) throw new Error('Failed to create ticket');
  return res.json();
}

export async function overrideTicketPriority(id: string, overrideData: Record<string, any>) {
  const res = await fetch(`${API_BASE}/api/tickets/${id}/override`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(overrideData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to override priority');
  }
  return res.json();
}

export async function fetchAuditLogs(params: Record<string, any> = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/audit-logs?${query}`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function fetchOrganisations() {
  const res = await fetch(`${API_BASE}/api/organisations`);
  if (!res.ok) throw new Error('Failed to fetch organisations');
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/api/auth/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function fetchConfigThresholds() {
  const res = await fetch(`${API_BASE}/api/config/thresholds`);
  if (!res.ok) throw new Error('Failed to fetch configuration');
  return res.json();
}

export async function updateConfigThresholds(config: Record<string, any>) {
  const res = await fetch(`${API_BASE}/api/config/thresholds`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error('Failed to update configuration');
  return res.json();
}

export async function fetchPerformanceEvaluation() {
  const res = await fetch(`${API_BASE}/api/analytics/evaluation`);
  if (!res.ok) throw new Error('Failed to fetch performance evaluation');
  return res.json();
}

export async function fetchFalsePositives() {
  const res = await fetch(`${API_BASE}/api/analytics/false-positives`);
  if (!res.ok) throw new Error('Failed to fetch false positives');
  return res.json();
}

export async function fetchFalseNegatives() {
  const res = await fetch(`${API_BASE}/api/analytics/false-negatives`);
  if (!res.ok) throw new Error('Failed to fetch false negatives');
  return res.json();
}

export async function fetchEdgeCases() {
  const res = await fetch(`${API_BASE}/api/edge-cases`);
  if (!res.ok) throw new Error('Failed to fetch edge cases');
  return res.json();
}
