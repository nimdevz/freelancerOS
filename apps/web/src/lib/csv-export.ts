/**
 * Universal CSV Export Utility for FreelancerOS Business Data
 */

export function downloadCsv(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const escapeCell = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(escapeCell).join(',');
  const dataRows = rows.map((row) => row.map(escapeCell).join(','));
  const csvContent = [headerRow, ...dataRows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportInvoicesToCsv(invoices: any[]) {
  const headers = ['Invoice Number', 'Title', 'Client', 'Status', 'Issue Date', 'Due Date', 'Total', 'Paid', 'Balance Due', 'Currency'];
  const rows = invoices.map((inv) => [
    inv.invoiceNumber,
    inv.title || '',
    inv.clientName || '',
    inv.status,
    inv.issueDate,
    inv.dueDate,
    inv.totalAmount || inv.total || 0,
    inv.amountPaid || 0,
    inv.balanceDue || 0,
    inv.currency || 'USD',
  ]);
  downloadCsv('freelanceros-invoices', headers, rows);
}

export function exportProjectsToCsv(projects: any[]) {
  const headers = ['Code', 'Project Name', 'Client', 'Status', 'Health', 'Budget', 'Paid', 'Expenses', 'Profit', 'Hours Tracked', 'Currency', 'Deadline'];
  const rows = projects.map((p) => [
    p.code,
    p.name,
    p.clientName || '',
    p.status,
    p.health || 'healthy',
    p.budget || 0,
    p.totalPaid || 0,
    p.totalExpenses || 0,
    p.profit || 0,
    p.totalHoursTracked || 0,
    p.currency || 'USD',
    p.deadline || '',
  ]);
  downloadCsv('freelanceros-projects', headers, rows);
}

export function exportTimeEntriesToCsv(timeEntries: any[]) {
  const headers = ['Date', 'Project', 'Description', 'Duration (Hours)', 'Duration (Minutes)', 'Billable', 'Hourly Rate', 'Total Amount', 'Invoiced'];
  const rows = timeEntries.map((t) => [
    t.date || t.startTime?.split('T')[0] || '',
    t.projectName || '',
    t.description || '',
    Math.round(((t.durationMinutes || 0) / 60) * 100) / 100,
    t.durationMinutes || 0,
    t.isBillable ? 'Yes' : 'No',
    t.hourlyRate || 0,
    Math.round(((t.durationMinutes || 0) / 60) * (t.hourlyRate || 0)),
    t.isInvoiced ? 'Yes' : 'No',
  ]);
  downloadCsv('freelanceros-timesheet', headers, rows);
}

export function exportClientsToCsv(clients: any[]) {
  const headers = ['Client Name', 'Company', 'Email', 'Phone', 'Address', 'Status', 'Total Revenue', 'Outstanding Balance', 'Currency'];
  const rows = clients.map((c) => [
    c.name,
    c.company || '',
    c.email || '',
    c.phone || '',
    c.address || '',
    c.status || 'active',
    c.totalRevenue || 0,
    c.outstandingBalance || 0,
    c.currency || 'USD',
  ]);
  downloadCsv('freelanceros-clients', headers, rows);
}
