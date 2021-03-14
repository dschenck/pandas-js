import * as utils from '../utils'

/**
 * Returns the cumulative max of the given array
 * 
 * @param {*} values 
 */
export default function(values){
    return values.reduce((acc, curr, i) => {
        if(utils.isNaN(curr)){
            acc.push(i == 0 ? NaN : acc[-1])
        }
        else{
            //NaN is never greater than
            acc.push(acc[-1] < curr ? acc[-1] : curr)
        }
        return acc
    }, [])
}