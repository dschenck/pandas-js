/**
 * Compute the correlation between two arrays
 * 
 * @param {*} X 
 * @param {*} Y 
 * @param {*} options 
 */
export default function corr(X, Y, options){
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