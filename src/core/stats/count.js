import * as utils from '../utils'

/**
 * Returns the count of the numeric types
 * 
 * @param {*} values 
 * @param {*} options 
 */
export default function count(values, options){
    if(options && options.skipnan){
        return values.reduce((prev, curr) => {
            return utils.isNaN(curr) ? prev : prev + 1
        }, 0)
    }
    return values.reduce((prev, curr) => {
        return utils.isNA(curr) ? prev : prev + 1
    }, 0) 
}