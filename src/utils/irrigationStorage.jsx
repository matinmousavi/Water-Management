const STORAGE_PREFIX = 'irrigation_start'

export const makeIrrigationKey = landId => `${STORAGE_PREFIX}_${landId}`

export const getIrrigationStartTime = landId => {
	const key = makeIrrigationKey(landId)
	const value = localStorage.getItem(key)
	return value ? parseInt(value, 10) : null
}

export const setIrrigationStartTime = (landId, timestamp) => {
	const key = makeIrrigationKey(landId)
	localStorage.setItem(key, timestamp.toString())
}

export const removeIrrigationStartTime = landId => {
	const key = makeIrrigationKey(landId)
	localStorage.removeItem(key)
}
