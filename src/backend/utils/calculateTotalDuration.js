import Irrigation from '../models/Irrigation.model.js'

export const calculateTotalDuration = async ({ landId, landGroupId }) => {
	let irrigations = []

	if (landGroupId) {
		// فقط یک لاگ نماینده گروه بگیر (مثلاً اولین لاگ گروه)
		irrigations = await Irrigation.find({ landGroup: landGroupId, endedAt: { $ne: null } })
			.sort({ startedAt: 1 })
			.limit(1) // فقط یکی بگیریم که زمان دوبار حساب نشه
	} else if (landId) {
		irrigations = await Irrigation.find({ land: landId, endedAt: { $ne: null } })
	}

	let totalMinutes = 0
	for (const ir of irrigations) {
		if (ir.startedAt && ir.endedAt) {
			const diffMs = ir.endedAt - ir.startedAt
			totalMinutes += Math.floor(diffMs / (1000 * 60))
		}
	}

	const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
	const minutes = String(totalMinutes % 60).padStart(2, '0')
	return `${hours}:${minutes}`
}
