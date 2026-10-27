/**
 * CSV Export Utility
 * Converts JSON data to downloadable CSV files
 */

export function exportToCSV(data: Record<string, any>[], filename: string): void {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  const headers = Object.keys(data[0]);

  const escape = (val: any): string => {
    const str = val === null || val === undefined ? '' : String(val);
    // Escape double quotes and wrap in quotes if contains comma, newline or quote
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => escape(row[h])).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function prepareTicketsForExport(tickets: any[]): Record<string, any>[] {
  return tickets.map(t => ({
    ticket_id: t.ticket_id,
    organisation_name: t.organisation_name,
    contract_level: t.contract_level,
    affected_service: t.affected_service,
    service_category: t.service_category,
    user_group: t.user_group,
    number_of_affected_users: t.number_of_affected_users,
    baseline_priority: t.baseline_priority,
    improved_priority: t.improved_priority,
    final_priority: t.final_priority,
    total_impact_score: t.total_impact_score,
    clinical_score: t.clinical_score,
    business_score: t.business_score,
    criticality_score: t.criticality_score,
    is_overridden: t.is_overridden ? 'Yes' : 'No',
    incident_status: t.incident_status,
    response_time_minutes: t.response_time_minutes,
    resolution_time_minutes: t.resolution_time_minutes,
    actual_impact: t.actual_impact,
    created_date_time: t.created_date_time,
  }));
}

export function prepareAuditLogsForExport(logs: any[]): Record<string, any>[] {
  return logs.map(l => ({
    audit_id: l.id,
    ticket_id: l.ticket_id,
    timestamp: l.timestamp,
    user_name: l.user_name,
    user_role: l.user_role,
    organisation_name: l.organisation_name,
    original_priority: l.original_priority,
    updated_priority: l.updated_priority,
    reason: l.reason,
    evidence_summary: l.evidence_summary,
  }));
}
