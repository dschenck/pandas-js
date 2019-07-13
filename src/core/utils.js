/** 
 * Checks a value is a boolean 
 * 
 * @param {any} value the tested value
 * @returns {boolean} 
 */
export function isboolean(value){
    return typeof value === 'boolean' || value instanceof Boolean
}

/** 
 * Checks a value is a string
 * 
 * @param {any} value the tested value
 * @returns {boolean}
 */
export function isstring(value){
    return typeof value == 'string' || value instanceof String
}

/** Checks a value if a number 
 * 
 * @param {any} value the tested value
 * @returns {boolean}
*/
export function isnumber(value){
    return typeof value == 'number' || value instanceof Number
}

/** Checks a value is defined
 * Undefined values are NaN, null, undefined, +/-Infinity
 * 
 * @param {any} value the tested value
 * @returns {boolean}
 */
export function isdefined(value){
    return !(value !== value 
        || value === undefined 
        || value === null 
        || value === Infinity || value === -Infinity 
    )
}

/** 
 * Checks a value is numeric
 * Numeric values are defined (see above) numbers and booleans
 * 
 * @param {any} value the tested value
 * @returns {boolean}
 */
export function isnumeric(value){
    return isdefined(value) && (isnumber(value) || isboolean(value))
}

/**
 * Checks a value is non-numeric
 * This is stricter definition compared to isNaN or Number.isNaN
 * as it excludes null and Infinity
 * 
 * @param {any} value the tested value
 * @returns {boolean}
 */
export function isnan(value){
    return !isnumeric(value)
}

/**
 * Alias for isnan
 * 
 * @alias isnan
 */
export function isNaN(value){
    return isnan(value)
}

/**
 * Checks a value is not missing (not available)
 * 
 * @param {any} value 
 * @returns {boolean}
 */
export function isna(value){
    return !isdefined(value)
}

/**
 * Alias for isna
 * 
 * @alias isna
 */
export function isNA(value){
    return isna(value)
}