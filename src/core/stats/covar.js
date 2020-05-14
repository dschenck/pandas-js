import * as utils from '../utils'
import mean       from './mean'
import sum        from './sum'

/**
 * Returns the covariance of two arrays
 * 
 * @param {*} x 
 * @param {*} y 
 * @param {*} options 
 */
export default function covar(X, Y, options){
    if(X.length !== Y.length){
        throw new Error("X and Y should be of equal length")
    }

    X = X.filter((x, i) => !(utils.isNaN(X[i]) || utils.isNaN(Y[i])))
    Y = Y.filter((y, i) => !(utils.isNaN(X[i]) || utils.isNaN(Y[i])))
    
    const [ mx, my ] = [ mean(X), mean(Y) ]

    const errors = X.map((x, i) => (X[i] - mx) * (Y[i] - my))

    if(errors.length == 0) return NaN

    const ddof = options && options.ddof ? options.ddof : 1 
    
    return sum(errors)/(errors.length - ddof)
}