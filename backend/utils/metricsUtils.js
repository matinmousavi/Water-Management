import { millisecondsToHoursMinutes } from '../../utils/timeUtils.js'
import { sumTimeRangeDurationsMs } from './timeRangeUtils.js'

/**
 * Computes the total scheduled irrigation duration in milliseconds.
 * @param {Array<{ startTime?: string | Date, endTime?: string | Date }>} schedules - Scheduled slots.
 * @returns {number} Total duration in milliseconds.
 */
export const sumScheduleDurationsMs = (schedules = []) =>
        sumTimeRangeDurationsMs(schedules, { startKey: 'startTime', endKey: 'endTime' })

/**
 * Computes the total irrigation duration in milliseconds from completed logs.
 * @param {Array<{ startedAt?: string | Date, endedAt?: string | Date }>} irrigations - Irrigation logs.
 * @returns {number} Total duration in milliseconds.
 */
export const sumIrrigationDurationsMs = (irrigations = []) =>
        sumTimeRangeDurationsMs(irrigations, { startKey: 'startedAt', endKey: 'endedAt' })

/**
 * Formats water requirement metrics from millisecond aggregates.
 * @param {{ requiredMs?: number, receivedMs?: number }} [metrics]
 * @returns {{ requiredWater: string, receivedWater: string, remainingWater: string }}
 */
export const buildWaterMetrics = ({ requiredMs = 0, receivedMs = 0 } = {}) => ({
        requiredWater: millisecondsToHoursMinutes(requiredMs),
        receivedWater: millisecondsToHoursMinutes(receivedMs),
        remainingWater: millisecondsToHoursMinutes(Math.max(0, requiredMs - receivedMs)),
})
