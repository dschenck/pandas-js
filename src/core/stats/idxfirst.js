import * as utils from '../utils'

/**
 * Returns the index of the first valid value of the array
 * 
 * @param {*} values 
 * @param {*} options 
 */
export default function idxfirst(values, options){
    if(options && options.numeric){
        for(let i = 0; i < values.length; i++){
            if(!utils.isNaN(values[i])){
                return i
            }
        }
        return NaN
    }
    for(let i = 0; i < values.length; i++){
        if(!utils.isNA(values[i])){
            return i
        }
    }
    return NaN
}