import * as utils from '../utils'

/**
 * Returns the index of the largest numeric value
 * in the given list of values
 * 
 * @param {*} values 
 */
export default function(values){
    return values.reduce((acc, curr, i) => {
        if(utils.isNaN(curr)){
            return acc
        }
        if(utils.isNaN(acc)){
            return i
        }
        return values[i] > values[acc] ? i : acc
    }, NaN)
}