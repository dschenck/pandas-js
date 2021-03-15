import * as utils from '../utils'

/**
 * Returns the cumulative max of the given array
 * 
 * @param {*} values 
 */
export default function(values){
    return values.reduce((acc, curr, i) => {
        if(utils.isNaN(curr)){
            acc.push(i == 0 ? NaN : acc[i-1])
        }
        else{
            //NaN and undefined are never greater than
            acc.push(acc[i-1] > curr ? acc[i-1] : curr)
        }
        return acc
    }, [])
}