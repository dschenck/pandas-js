import * as utils from '../utils'

/**
 * Returns the cumulative min of the given array
 * 
 * @param {*} values 
 */
export default function(values){
    return values.reduce((acc, curr, i) => {
        if(utils.isNaN(curr)){
            acc.push(i == 0 ? NaN : acc[-1])
        }
        else{
            if(i == 0 || utils.isNaN(acc[-1])){
                acc.push(curr)
            }
            else{
                acc.push(acc[-1] + curr)
            }
        }
        return acc
    }, [])
}