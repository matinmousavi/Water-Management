const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

/**
 * Replaces English numerals in a string with their Persian equivalents.
 * @param {string | number} value - The value containing English digits.
 * @returns {string} String with English digits converted to Persian digits.
 */
export const convertEnglishDigitsToPersian = value => {
        const normalizedValue = value == null ? '' : String(value)
        return normalizedValue.replace(/\d/g, digit => PERSIAN_DIGITS[Number(digit)])
}
