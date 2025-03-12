export default async function expire<T = unknown>(
  valueKey: string,
  expiryKey: string
): Promise<T | null> {
  const itemStr: string | null = localStorage.getItem(valueKey);
  const expiryStr: string | null = localStorage.getItem(expiryKey);

  // Check if either the item or expiry doesn't exist.
  if (!itemStr || !expiryStr) {
    return null;
  }

  const item: T = JSON.parse(itemStr);
  const expiry: number = JSON.parse(expiryStr);
  const now = new Date();

  if (now.getTime() > expiry) {
    localStorage.removeItem(valueKey);
    localStorage.removeItem(expiryKey);

    if (valueKey === 'adminToken') {
      localStorage.removeItem('adminTokenV');
    }
    return null;
  }
  return item;
}
