import * as utils from '../utils'

/**
 * 
 * @param {*} values 
 * @param {*} options 
 */
export default function(values, q){
    values = values.filter(v => !utils.isNaN(v)).sort((a, b) => a - b)
    if(values.length == 0) return NaN
    return values[Math.max(0, Math.round(q * values.length) - 1)]
}