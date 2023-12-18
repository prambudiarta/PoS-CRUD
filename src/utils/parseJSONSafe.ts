export function parseJSONSafe(key: any) {
  const item = localStorage.getItem(key);
  if (!item) return null;

  try {
    return JSON.parse(item);
  } catch (error) {
    console.error('Error parsing JSON from localStorage:', error);
    return null;
  }
}
