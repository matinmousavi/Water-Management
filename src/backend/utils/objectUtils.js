/**
 * Picks a comma-separated list of properties from an object.
 * @param {Record<string, any>} source - Object to select fields from.
 * @param {string} [fields] - Comma-separated list of property names.
 * @returns {Record<string, any>} New object containing only requested fields.
 */
export const pickFields = (source, fields) => {
	if (!fields) return source
	const selected = {}
	fields.split(',').forEach(field => {
		if (source[field] !== undefined) selected[field] = source[field]
	})
	return selected
}
