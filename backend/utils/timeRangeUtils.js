/**
 * Calculates the total duration in milliseconds for records with start and end timestamps.
 * @template T extends Record<string, any>
 * @param {T[] | undefined} records - Collection of records containing time ranges.
 * @param {{ startKey?: keyof T & string, endKey?: keyof T & string }} [options]
 * @returns {number} Aggregate duration in milliseconds.
 */
export const sumTimeRangeDurationsMs = (records = [], { startKey = 'startTime', endKey = 'endTime' } = {}) =>
        records.reduce((total, record) => {
                const startValue = record?.[startKey]
                const endValue = record?.[endKey]
                if (!startValue || !endValue) return total

                const start = new Date(startValue)
                const end = new Date(endValue)
                if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return total

                return total + Math.max(0, end - start)
        }, 0)
