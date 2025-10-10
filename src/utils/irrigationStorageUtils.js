const STORAGE_PREFIX = 'irrigation_start'
const STORAGE_PREFIX_GROUP = 'irrigation_group_start'

/**
 * Builds a localStorage key for an irrigation land identifier.
 * @param {string} landId - Identifier of the land.
 * @returns {string} Storage key for the land irrigation start time.
 */
export const createIrrigationLandKey = landId => `${STORAGE_PREFIX}_${landId}`

/**
 * Builds a localStorage key for an irrigation group identifier.
 * @param {string} groupId - Identifier of the land group.
 * @returns {string} Storage key for the group irrigation start time.
 */
export const createIrrigationGroupKey = groupId => `${STORAGE_PREFIX_GROUP}_${groupId}`

/**
 * Retrieves the persisted irrigation start timestamp for a land.
 * @param {string} landId - Identifier of the land.
 * @returns {number | null} Stored start time in milliseconds.
 */
export const getIrrigationStartTime = landId => {
        const key = createIrrigationLandKey(landId)
        const value = localStorage.getItem(key)
        return value ? parseInt(value, 10) : null
}

/**
 * Retrieves the persisted irrigation start timestamp for a land group.
 * @param {string} groupId - Identifier of the land group.
 * @returns {number | null} Stored start time in milliseconds.
 */
export const getIrrigationGroupStartTime = groupId => {
        const key = createIrrigationGroupKey(groupId)
        const value = localStorage.getItem(key)
        return value ? parseInt(value, 10) : null
}

/**
 * Stores the irrigation start timestamp for a land.
 * @param {string} landId - Identifier of the land.
 * @param {number} timestamp - Start time in milliseconds.
 */
export const setIrrigationStartTime = (landId, timestamp) => {
        const key = createIrrigationLandKey(landId)
        localStorage.setItem(key, timestamp.toString())
}

/**
 * Removes the irrigation start timestamp for a land.
 * @param {string} landId - Identifier of the land.
 */
export const clearIrrigationStartTime = landId => {
        const key = createIrrigationLandKey(landId)
        localStorage.removeItem(key)
}
