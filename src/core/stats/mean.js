import count from './count'
import sum   from './sum'

/**
 * Returns the mean of the numeric types
 * @param {*} values 
 */
export default function mean(values){
    const n = count(values)
    return n == 0 ? NaN : sum(values)/n
}