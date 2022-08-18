export default async function expire(valueKey, expiryKey) {
    const itemStr = localStorage.getItem(valueKey);
    const expiryStr = localStorage.getItem(expiryKey);

	if (!itemStr) {
		return null;
	}
	const item = JSON.parse(itemStr);
	const expiry = JSON.parse(expiryStr);
	const now = new Date();
    if (now.getTime() > expiry) {
		localStorage.removeItem(valueKey)
		return null
	}
	return item
}