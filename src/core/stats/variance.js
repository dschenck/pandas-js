import * as utils from '../utils'
import count      from './count'
import mean       from './mean'

/**
 * Returns the variance of the values
 * 
 * @param {*} values 
 * @param {*} options
 */
export default function variance(values, options){
    //degrees of freedom
    const ddof = (!options || options.ddof === undefined) ? 1 : options.ddof
    
    //count number of numeric values
    const n = count(values)
   
    //if n less ddof is less than 0
    if(n - ddof <= 0) return NaN

    //mean value
    const m = mean(values)
    
    //sum of square errors divided by N less ddof
    return values.map(v => {
        return utils.isNaN(v) ? 0 : Math.pow(v - m, 2)
    }).reduce((sum, error) => {
        return error + sum
    })/(n - ddof)
}