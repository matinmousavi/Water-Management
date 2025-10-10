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
