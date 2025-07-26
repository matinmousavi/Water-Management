export function sanitizeQuery(query) {
	const sanitized = {}
	for (const key in query) {
		if (typeof query[key] === 'string') {
			sanitized[key] = query[key]
		}
	}
	return sanitized
}
