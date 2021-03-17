import * as utils from '../utils'

/**
 * Returns the index of the last valid value of the array
 * 
 * @param {*} values 
 * @param {*} options 
 */
export default function idxlast(values, options){
    if(options && options.numeric){
        for(let i = values.length; i > 0; i--){
            if(!utils.isNaN(values[i-1])){
                return i-1
            }
        }
        return NaN
    }
    for(let i = values.length; i > 0; i--){
        if(!utils.isNA(values[i-1])){
            return i-1
        }
    }
    return NaN
}