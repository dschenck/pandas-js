import variance from './variance'

/**
 * Returns the standard deviation of the values
 * 
 * @param {*} values 
 * @param {*} options 
 */
export default function std(values, options){
    return Math.sqrt(variance(values, options))
}