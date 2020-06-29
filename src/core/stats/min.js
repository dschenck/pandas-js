import * as utils from '../utils'

export default function min(values){
    return values.reduce((prev, curr) => utils.isNaN(curr) ? prev : utils.isNaN(prev) ? curr : curr < prev ? curr : prev, NaN)
}