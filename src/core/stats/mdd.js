import * as utils from '../utils'

/**
 * @typedef {Object} Drawdown
 * @property {number} peak     - The index of the start of the drawdown
 * @property {number} trough   - The index of the end of the drawdown
 * @property {number} recovery - The index of the recovery date (if it exists)
 * @property {number} open     - The value as at the start of the drawdown
 * @property {number} close    - The value as at the end of the drawdown
 * @property {number} loss     - The loss
 */

/**
 * Returns information about the the maximum drawdown
 * from the given prices 
 * 
 * @param {*} values 
 * @returns {Drawdown} the drawdown
 */
export default function(values){
    const cummax = values.reduce((acc, curr, i) => {
        if(utils.isNaN(curr)){
            acc.push(i == 0 ? {index:NaN, value:NaN} : acc[-1])
        }
        else{
            //NaN is never greater than
            acc.push(acc[-1].value > curr ? acc[-1] : {index:i, value:curr})
        }
        return acc
    }, [])

    return values.reduce((acc, curr, i) => {
        if(utils.isNaN(curr)){
            return acc
        }
        //if curr is not NaN, cummax is necessarily defined
        if(utils.isNaN(acc.loss) || (curr/cummax[i] - 1) < acc.loss){
            acc.peak     = cummax[i].index
            acc.trough   = i
            acc.recovery = undefined //reset the recovery
            acc.open     = cummax[i].value
            acc.close    = curr 
            acc.loss     = curr/cummax[i].value - 1
        }
        if(!utils.isNaN(acc.loss) && curr > acc.open && acc.recovery === undefined){
            acc.recovery = i
        }
        return acc
    }, {loss:NaN})
}