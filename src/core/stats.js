import * as utils from './utils'

/**
 * Returns the sum of the numeric types
 * @param {iterable} values 
 */
export function sum(values){
    return values.reduce((prev, curr) => utils.isNaN(curr) ? prev : utils.isNaN(prev) ? curr : curr + prev, NaN)
}

/**
 * Returns the count of the numeric types
 * @param {*} values 
 * @param {*} options 
 */
export function count(values, options){
    if(!options || options.skipnan){
        return values.reduce((prev, curr) => utils.isNaN(curr) ? prev : prev + 1, 0)
    }
    return values.reduce((prev, curr) => utils.isNA(curr) ? prev : prev + 1, 0) 
}

/**
 * Returns the mean of the numeric types
 * @param {*} values 
 */
export function mean(values){
    const n = count(values)
    return n == 0 ? NaN : sum(values)/n
}

/**
 * Returns the variance of the values
 * 
 * @param {*} values 
 * @param {*} options
 */
export function variance(values, options){
    const n = count(values)
    if(n == 0) return NaN
    const m = mean(values)
    const ddof = options && options.ddof ? options.ddof : 1 
    return values.map(v => utils.isNaN(v) ? 0 : Math.pow(v - m, 2)).reduce((sum, error) => error + sum)/(n - ddof)
}

/**
 * Returns the standard deviation of the values
 * 
 * @param {*} values 
 * @param {*} options 
 */
export function std(values, options){
    return Math.sqrt(variance(values, options))
}

/**
 * Returns the covariance of two arrays
 * 
 * @param {*} x 
 * @param {*} y 
 * @param {*} options 
 */
export function covar(X, Y, options){
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

/**
 * Compute the correlation between two arrays
 * 
 * @param {*} X 
 * @param {*} Y 
 * @param {*} options 
 */
export function corr(X, Y, options){
    if(X.length !== Y.length){
        throw new Error("X and Y should be of equal length")
    }

    //filter values for any NaN
    X = X.filter((x, i) => !(utils.isNaN(X[i]) || utils.isNaN(Y[i])))
    Y = Y.filter((y, i) => !(utils.isNaN(X[i]) || utils.isNaN(Y[i])))
    
    if(X.length == 0) return NaN

    //mean values (fast)
    const [ mx, my ] = [ sum(X)/X.length, sum(Y)/Y.length ]

    //variance (fast)
    const vx = X.reduce((prev, curr) => prev + Math.pow(curr - mx, 2), 0)
    const vy = Y.reduce((prev, curr) => prev + Math.pow(curr - my, 2), 0)

    //covariance (fast)
    const cv = X.map((x, i) => (X[i] - mx) * (Y[i] - my))

    return cv/Math.sqrt(vx * vy)
}

/**
 * Computes the numeric maximum
 */
export function max(values){
    return values.reduce((prev, curr) => utils.isNaN(curr) ? prev : utils.isNaN(prev) ? curr : curr > prev ? curr : prev, NaN)
}

/**
 * Computes the numeric minimum
 */
export function min(values){
    return values.reduce((prev, curr) => utils.isNaN(curr) ? prev : utils.isNaN(prev) ? curr : curr < prev ? curr : prev, NaN)
}

/**
 * Returns the index (0-based) of the max
 */
export function idxmax(values){
    const m = max(values)
    return utils.isNaN(m) ? NaN : values.indexOf(m)
}

/**
 * Returns the index (0-based) of the minimum
 */
export function idxmin(values){
    const m = min(values)
    return utils.isNaN(m) ? NaN : values.indexOf(m)
}





