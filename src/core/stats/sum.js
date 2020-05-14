import * as utils from '../utils'

/**
 * Returns the sum of the numeric types
 * 
 * @param {iterable} values 
 */
export default function sum(values){
    return values.reduce((prev, curr) => {
        return utils.isNaN(curr) ? prev : utils.isNaN(prev) ? curr : curr + prev
    }, NaN)
}