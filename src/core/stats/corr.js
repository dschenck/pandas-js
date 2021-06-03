import * as utils from '../utils'
import jstat from 'jstat'

/**
 * Compute the correlation between two arrays
 * 
 * @param {*} X 
 * @param {*} Y 
 * @param {*} options 
 */
export default function corr(X, Y) {
    if (X.length !== Y.length) {
        throw new Error("X and Y should be of equal length")
    }

    return jstat.corrcoeff(
        X.filter((x, i) => !(utils.isNaN(x) || utils.isNaN(Y[i]))),
        Y.filter((y, i) => !(utils.isNaN(y) || utils.isNaN(X[i])))
    )
}