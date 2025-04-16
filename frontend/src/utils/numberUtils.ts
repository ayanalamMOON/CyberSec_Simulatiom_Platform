export function formatNumber(num: number, decimals = 2): string {
  if (isNaN(num)) return 'N/A';
  return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatPercent(num: number, decimals = 2): string {
  if (isNaN(num)) return 'N/A';
  return `${(num * 100).toFixed(decimals)}%`;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (isNaN(bytes) || bytes < 0) return 'N/A';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}