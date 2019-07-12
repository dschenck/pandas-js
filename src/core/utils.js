export function isna(value){
    return value === undefined || isNaN(value) || value == +Infinity || value === -Infinity
}
export function isnan(value){
    return isNaN(value) || value == +Infinity || value === -Infinity
}
export function isstring(value){
    return typeof value === 'string' || value instanceof String
}