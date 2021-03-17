import * as utils from '../utils'

/**
 * Returns the first valid value of the array
 * 
 * @param {*} values 
 * @param {*} options 
 */
export default function first(values, options){
    if(options && options.numeric){
        for(let i = 0; i < values.length; i++){
            if(!utils.isNaN(values[i])){
                return values[i]
            }
        }
        return NaN
    }
    for(let i = 0; i < values.length; i++){
        if(!utils.isNA(values[i])){
            return values[i]
        }
    }
    return NaN
}