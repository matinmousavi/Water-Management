/**
 * Extracts string-based query parameters to prevent prototype pollution from complex inputs.
 * @param {Record<string, unknown>} query - Incoming request query object.
 * @returns {Record<string, string>} Sanitized query containing only string values.
 */
export const sanitizeQuery = query => {
	const sanitized = {}
	for (const key in query) {
		if (typeof query[key] === 'string') {
			sanitized[key] = query[key]
		}
	}
	return sanitized
}

/**
 * Builds a MongoDB projection object from `req.query.fields`.
 * @param {import('express').Request} req - Incoming request object.
 * @returns {Record<string, 1> | null} Projection object or null when no fields were requested.
 */
export const getProjection = req => {
	const fieldsParam = req?.query?.fields
	if (typeof fieldsParam !== 'string' || !fieldsParam.trim()) {
		return null
	}

	const projection = {}
	fieldsParam
		.split(',')
		.map(field => field.trim())
		.filter(Boolean)
		.forEach(field => {
			projection[field] = 1
		})

	return Object.keys(projection).length ? projection : null
}
