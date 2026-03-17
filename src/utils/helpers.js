export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: 'QAR',
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function statusColor(status) {
  const colors = {
    active: '#4ade80',
    inactive: '#fb7185',
    draft: '#94a3b8',
    issued: '#6ea8fe',
    partially_paid: '#fbbf24',
    paid: '#4ade80',
    cancelled: '#fb7185',
    on_hold: '#fbbf24',
    completed: '#4ade80',
    withdrawn: '#fb7185',
  };
  return colors[status] || '#94a3b8';
}
