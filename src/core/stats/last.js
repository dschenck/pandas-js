import * as utils from '../utils'

/**
 * Returns the last valid value of the array
 * 
 * @param {*} values 
 * @param {*} options 
 */
export default function last(values, options){
    if(options && options.skipnan){
        for(let i = values.length; i > 0; i--){
            if(!utils.isNaN(values[i-1])){
                return values[i-1]
            }
        }
        return NaN
    }
    for(let i = values.length; i > 0; i--){
        if(!utils.isNA(values[i-1])){
            return values[i-1]
        }
    }
    return NaN
}