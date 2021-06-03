import * as utils from '../utils'
import jstat from 'jstat'

/**
 * Returns the covariance of two arrays
 * 
 * @param {*} x 
 * @param {*} y 
 * @param {*} options 
 */
export default function covar(X, Y, options) {
    if (X.length !== Y.length) {
        throw new Error("X and Y should be of equal length")
    }

    return jstat.covariance(
        X.filter((x, i) => !(utils.isNaN(x) || utils.isNaN(Y[i]))),
        Y.filter((y, i) => !(utils.isNaN(y) || utils.isNaN(Y[i])))
    )
}