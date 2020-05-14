/**
 * Returns true if all values are truthy
 * 
 * @param {*} values 
 */
export function all(values){
    return values.reduce((prev, curr) => curr ? prev && true: false, true)
}