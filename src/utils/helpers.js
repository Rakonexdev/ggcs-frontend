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

export function timeAgo(date) {
  if (!date) return '—';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minute' + (Math.floor(interval) !== 1 ? 's' : '') + ' ago';
  return Math.max(0, Math.floor(seconds)) + ' seconds ago';
}
