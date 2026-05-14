function pad(value) {
  return String(value).padStart(2, '0');
}

export function formatDateTime(value) {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  const day = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  return `${time} ${day}`;
}

export function isDateTimeField(key) {
  return /(^|_)(at|time)$/.test(key);
}
