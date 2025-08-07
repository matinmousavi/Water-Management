export const pickFields = (obj, fields) => {
	if (!fields) return obj
	const selected = {}
	fields.split(',').forEach(f => {
		if (obj[f] !== undefined) selected[f] = obj[f]
	})
	return selected
}
