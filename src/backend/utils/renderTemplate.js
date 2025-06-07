export function renderTemplate(template, variables = {}) {
	return template.replace(/{{(.*?)}}/g, (_, key) => {
		const value = variables[key.trim()]
		return value !== undefined ? value : ''
	})
}
