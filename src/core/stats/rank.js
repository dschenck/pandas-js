import * as utils from '../utils'

/**
 * Ranks the values from 1 to n
 * setting NaN for non-numeric values
 * Ties are assigned the lowest common rank
 * 
 * @param {*} values 
 * @param {*} options 
 */
export default function(values, options){
    const mapping = values.filter(v => {
        return !utils.isNaN(v)
    }).sort((a, b) => {
        return a - b
    }).reduce((acc, curr, i, values) => {
        if(!acc.has(curr)){
            if(options && options.normalized){
                acc.set(curr, (i + 1)/values.length)
            }
            else{
                acc.set(curr, i + 1)
            }
        }
        return acc
    }, new Map())

    if(options && options.ascending === false){
        return values.map(value => {
            return mapping.has(value) ? mapping.size - mapping.get(value) + 1 : NaN
        })
    }

    return values.map(value => {
        return mapping.has(value) ? mapping.get(value) : NaN
    })
}