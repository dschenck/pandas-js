import moment from 'dayjs'

import Index from './Index'
import { SeriesGroupby, Pivot, Rolling } from './Grouper'
import * as utils    from './utils'
import * as stats    from './stats'

export default class Series{
    constructor(data, options){
        if(data === undefined){
            this._values = []
        }
        else if(data instanceof Series){
            this._values = data.values
            this._name   = data.name
            this._index  = data.index
        }
        else if(utils.isIterable(data) && !utils.isString(data)){
            this._values = [...data]
        }
        else if(typeof data == "object"){
            if(data.data && data.index){
                return new Series(data.data, {name:data.name, index:data.index})
            }
            this._values = Object.values(data)
            this._index  = new Index(Object.keys(data))
        }
        else{ 
            throw new TypeError('Could not parse the data')
        }

        if(options && options.name){
            this._name = options.name
        }
        if(options && options.index){
            this._index = new Index(options.index)
            if(this._index.length != this._values.length){
                throw new Error('Index and data are of different length')
            }
        }
        else if(this._index === undefined){
            this._index = new Index(utils.range(this._values.length))
        }
    }
    /**
     * Returns the values as a primitive list
     */
    get values(){
        return [...this._values]
    }

    /**
     * Returns the index
     */
    get index(){
        return this._index
    }

    /**
     * Returns a list of (key:value)
     */
    get items(){
        return this._values.map((v, i) => [this.index.at(i), v])
    }

    /**
     * Returns the name of the series
     * 
     * @returns {*}
     */
    get name(){
        return this._name
    }

    /**
     * Returns the length of the series
     * 
     * @returns {number}
     */
    get length(){
        return this._values.length
    }

    /**
     * Sets a new index
     */
    set index(values){
        const index = new Index(values)
        if(index.length != this.length){
            throw new Error('Length mismatch error')
        }
        this._index = index
    }

    [Symbol.iterator]() {
        let index = 0;
    
        return {
            next: () => {
                if (index < this._values.length) {
                    return {value: this._values[index++], done: false}
                } else {
                    return {done: true}
                }
            }
        }
    }

    /**
     * Returns a new renamed series
     * If options.inplace, then the operation is in-place
     *    and returns nothing
     * 
     * @param {*} name the new name
     * @param {*} options options.inplace to change operation to inplace
     */
    rename(name){
        return new Series(this._values, {name:name, index:this.index})
    }
    /**
     * Retrieves the value at a given label (index value)
     * Should throw an error if a label is not present in the index
     * 
     * @param {Array|Series} labels the label(s) at which to retrieve a value
     * @returns {*} return type depends on labels type
     */
    loc(labels){
        if(utils.isIterable(labels) && !utils.isString(labels)){
            return new Series(
                labels.map(label => this.loc(label)), 
                {name:this.name, index:labels}
            )
        }
        return this._values[this.index.indexOf(labels)]
    }
    /**
     * Retrives the value at a provided position (index)
     * 
     * @param {number} index the position (index)
     * @returns {*} the value at the provided position
     */
    iloc(indices){
        if(utils.isIterable(indices) && !utils.isString(indices)){
            return new Series(
                [...indices].map(i => this.iloc(i)), 
                {name:this.name, index:[...indices].map(i => this.index.at(i))}
            )
        }
        if(indices >= this.length || (this.length + indices) < 0){
            throw new Error('Out of bounds error')
        }
        return this._values[indices >= 0 ? indices : this.length + indices]
    }
    /**
     * Slices by label
     * Exclusive of upper bound
     * 
     * @param {*} start 
     * @param {*} stop
     */
    slice(start, stop){
        const index = this.index.slice(start, stop)
        return new Series(index._values.map(idx => this.loc(idx)), {index:index, name:this.name})
    }

    /**
     * Slices the series by position (index)
     * The upper bound is excluded
     * 
     * @param {number} begin the index (0-based) of the beginning of the slice
     * @param {number} [end=undefined] the index (0-based) of the end of the slice, excluded 
     * @returns {Series}
     */
    islice(start, stop){
        if(start > this.length || (this.length + start) < 0){
            throw new Error('Out of bounds error')
        }
        if(stop && (stop > this.length || (this.length + stop) < 0)){
            throw new Error('Out of bounds error')
        }
        return new Series(this._values.slice(start, stop), {name:this.name, index:this.index.islice(start, stop)})
    }

    /**
     * Slices the first n rows
     * 
     * @param {number} count the number of rows
     * @returns {Series}
     */
    head(count = 3){
        return this.slice(0, count)
    }

    /**
     * Slices the last n rows
     * 
     * @param {number} count the number of rows
     * @returns {Series}
     */
    tail(count = 3){
        return this.slice(-count)
    }

    /**
     * Returns a copy
     * 
     * @returns {Series}
     */
    copy(){
        return new Series(this._values, {name:this.name, index:this.index})
    }
    
    /**
     * Returns a new series with the values reversed relative to the index
     * e.g. first > last
     * 
     * @param {*} options options.inplace changes the values in-place
     * @returns {Series} 
     */
    reverse(options){
        if(options && options.inplace){
            this._values = [...this._values].reverse()
            this._index  = this.index.reverse()
            return
        }
        return new Series([...this._values].reverse(), {name:this.name, index:this.index.reverse()})
    }

    /**
     * Map over each of the values in the series and apply a function
     * The function receives the current value and the positional index
     * 
     * @param {function} func function to compute over each value
     * @param {*} options options.inplace to transform in-place
     * @returns {Series}
     */
    map(func, options){
        if(options && options.inplace){
            this._values = this._values.map(func)
            return
        }
        return new Series(this._values.map(func), {name:this.name, index:this.index})
    }

    /**
     * Returns a boolean series flagging non-numeric types
     * 
     * @returns {Series}
     */
    isNaN(){
        return this.map((value) => utils.isNaN(value))
    }

    /**
     * Returns a boolean series flagging missing values
     * 
     * @returns {Series}
     */
    isNA(){
        return this.map((value) => utils.isNA(value))
    }
    
    /**
     * Computes the boolean inverse of the series
     * true -> false and false -> true
     * @returns {Series}
     */
    not(){
        return this.map((value) => !value)
    }

    /**
     * Checks all the values are truthy
     * 
     * @returns {boolean}
     */
    all(){
        return this.reduce((prev, curr) => curr ? prev && true: false, true)
    }

    /**
     * Checks at least one of the values is truthy
     * 
     * @returns {boolean}
     */
    any(){
        return this.reduce((prev, curr) => curr ? (prev || true) : (prev || false), false)
    }

    /**
     * Computes the absolute value of each element in the series
     * 
     * @returns {Series}
     */
    abs(){
        return this.map(value => utils.isNaN(value) ? NaN : Math.abs(value))
    }

    /**
     * Compute the negative of each element in the series
     * This is not the inverse of .abs()
     * 
     * @returns {Series}
     */
    neg(){
        return this.map(value => utils.isNaN(value) ? NaN : -value)
    }
    
    /**
     * Reduces the series to a single value
     * @param {*} func 
     * @param {*} initvalue 
     */
    reduce(func, initvalue){
        return this._values.reduce(func, initvalue)
    }
    
    /**
     * Computes the sum of the numeric values in the series
     *
     * @returns {number|NaN}
     */
    sum(){
        return this.reduce((prev, curr) => utils.isNaN(curr) ? prev : utils.isNaN(prev) ? curr : curr + prev, NaN)
    }

    /**
     * Counts the number of values
     * Use skipnan=false to count non-missing values
     * Use this.length to count all values
     * 
     * @param {boolean} [skipnan=true] whether to count only numeric values
     * @returns {number}
     */
    count(skipnan = true){        
        return this.reduce((prev, curr) => skipnan ? (utils.isNaN(curr) ? prev : prev + 1) : (utils.isNA(curr) ? prev : prev + 1), 0)
    }

    /**
     * Computes the mean (average) of the series
     * 
     * @returns {number|NaN}
     */
    mean(){
        return this.count() == 0 ? NaN : this.sum() / this.count()
    }

    /**
     * Computes the variance
     * 
     *  @param {int} ddof 
     */
    var(ddof = 1){
        const mean = this.mean()
        return this._values.map(v => {
            return utils.isNaN(v) ? NaN : Math.pow(v - mean, 2)
        }).reduce((sum, error) => {
            return utils.isNaN(error) ? sum : utils.isNaN(sum) ? error : error + sum
        }, NaN)/(this.count() - ddof)
    }

    /**
     * Returns the standard deviation
     * 
     * @param {int} ddof 
     */
    std(ddof = 1){
        return Math.sqrt(this.var(ddof))
    }

    /**
     * Returns the correlation of this and other 
     * If other is a Series, aligns the indices first
     */
    covar(other, options){
        if(other instanceof Series){
            if(!options || !options["ignore axis"]){
                const index = this.index.intersection(other.index)
                if(index.length == 0) return NaN
                return stats.covar(this.reindex(index)._values, other.reindex(index)._values)
            }
        }
        if(other.length != this.length){
            throw new Error("Length mismatch")
        }
        return stats.covar(this._values, [...other])
    }

    /**
     * Returns the correlation of this and other 
     * If other is a Series, aligns the indices first
     */
    corr(other, options){
        if(other instanceof Series){
            if(!options || !options["ignore axis"]){
                const index = this.index.intersection(other.index)
                if(index.length == 0) return NaN
                return stats.corr(this.reindex(index)._values, other.reindex(index)._values)
            }
        }
        if(other.length != this.length){
            throw new Error("Length mismatch")
        }
        return stats.corr(this._values, [...other])
    }


    /**
     * Returns the maximum drawdown 
     * 
     * @param {*} field 
     */
    mdd(field = "return"){
        if(field == "return") return this.divide(this.cummax()).min() - 1
        if(field == "valley") return this.iloc(this.divide(this.cummax()).idxmin())
        if(field == "valley date") return this.index.at(this._values.indexOf(this.mdd("valley")))
        if(field == "peak") return this.cummax().iloc(this.divide(this.cummax()).idxmin())
        if(field == "peak date") return this.index.at(this._values.indexOf(this.mdd("peak")))
    }

    /**
     * Returns the compounded annual growth rate between the first and the last value
     * Index is assumed to be dates as timestamps
     */
    cagr(){
        return Math.pow(this.last()/this.first(), 365.25 * 1000 * 3600 * 24 / (this.index.at(-1) - this.index.at(0))) - 1
    }

    /**
     * Computes the numeric maximum
     */
    max(){
        return this.reduce((prev, curr) => utils.isNaN(curr) ? prev : utils.isNaN(prev) ? curr : curr > prev ? curr : prev, NaN)
    }

    /**
     * Computes the numeric minimum
     */
    min(){
        return this.reduce((prev, curr) => utils.isNaN(curr) ? prev : utils.isNaN(prev) ? curr : curr < prev ? curr : prev, NaN)
    }

    /**
     * Returns the index (0-based) of the max
     */
    idxmax(){
        return utils.isNaN(this.max()) ? NaN : this._values.indexOf(this.max())
    }

    /**
     * Returns the index (0-based) of the minimum
     */
    idxmin(){
        return utils.isNaN(this.min()) ? NaN : this._values.indexOf(this.min())
    }

    /**
     * Returns the first numeric (or non-missing) value
     */
    first(skipnan = true){
        for(let i = 0; i < this.length; i++){
            if(!(skipnan ? utils.isNaN(this._values[i]) : utils.isNA(this._values[i]))){
                return this._values[i]
            }
        }
        return NaN
    }

    /**
     * Returns the index of the first numeric (or non-missing value)
     */
    idxfirst(skipnan = true){
        for(let i = 0; i < this.length; i++){
            if(!(skipnan ? utils.isNaN(this._values[i]) : utils.isNA(this._values[i]))){
                return i
            }
        }
        return NaN
    }

    /**
     * Returns the first numeric (or non-missing) value
     */
    last(skipnan = true){
        for(let i = this.length - 1 ; i >= 0; i--){
            if(!(skipnan ? utils.isNaN(this._values[i]) : utils.isNA(this._values[i]))){
                return this._values[i]
            }
        }
        return NaN
    }
    
    /**
     * Returns the index of the last numeric (or non-missing) value
     */
    idxlast(skipnan = true){
        for(let i = this.length - 1 ; i >= 0; i--){
            if(!(skipnan ? utils.isNaN(this._values[i]) : utils.isNA(this._values[i]))){
                return i
            }
        }
        return NaN
    }

    /**
     * Filters a series using a filtering function
     * Only values where the function returns true are kept
     * 
     * @param {function} func 
     * @param {*} options 
     * @returns {Series}
     */
    filter(callback, options){
        const mask = this._values.map((value, i) => callback(value, i))
        return new Series(this._values.filter((v, i) => mask[i]), 
            {name:this.name, index:this.index.filter((v, i) => mask[i])})
    }

    /**
     * Return a new series where missing values have been dropped
     * 
     */
    dropna(){
        return this.filter((value, i) => !utils.isNA(value))
    }

    /**
     * Return a new series where non-numeric values have been dropped
     * 
     */
    dropnan(){
        return this.filter((value, i) => !utils.isNaN(value))
    }

    /**
     * Filter every n-periods
     * 
     * @param {number} period 
     * @returns {Series}
     */
    every(period = 1){
        return this.filter((v, i) => i % period == 0)
    }

    /**
     * Applies an accumulator function, passing the previous cumulative result and current value to the callback
     * 
     * @param {function} reducer function reduces prev and current value to value
     * @param {*} [initialvalue=NaN] value to use as the first argument to the first call of the callback
     * @returns {Series}
     */
    accumulate(reducer, initialvalue = NaN){
        const values = this._values.reduce((acc, curr, idx) => {
            if(idx == 0) return arguments.length == 2 ? [reducer(initialvalue, curr)] : [reducer(NaN, curr)]
            acc.push(reducer(acc[idx-1], curr))
            return acc
        }, [])
        return new Series(values, {name:this.name, index:this.index})
    }

    /**
     * Returns the cumulative sum
     */
    cumsum(){
        return this.accumulate((prev, curr) => utils.isNaN(curr) ? prev : utils.isNaN(prev) ? curr : prev + curr)
    }
    
    /**
     * Returns the cumulaive product
     */
    cumprod(){
        return this.accumulate((prev, curr) => utils.isNaN(curr) ? prev : utils.isNaN(prev) ? curr : prev * curr)
    }

    /**
     * Returns the cumulative compound
     */
    cumcompound(initialvalue = 0){
        return this.accumulate((prev, curr) => utils.isNaN(curr) ? prev : utils.isNaN(prev) ? curr : (1 + prev) * (1 + curr) - 1, initialvalue)
    }

    /**
     * Returns the cumulative maximum
     */
    cummax(){
        return this.accumulate((prev, curr) => utils.isNaN(curr) ? prev : utils.isNaN(prev) ? curr : curr > prev ? curr : prev)
    }

    /**
     * Returns the cumulative minimum
     */
    cummin(){
        return this.accumulate((prev, curr) => utils.isNaN(curr) ? prev : utils.isNaN(prev) ? curr : curr < prev ? curr : prev)
    }

    /**
     * Combine this series with another iterable
     * 
     * @param {*} other 
     * @param {*} func 
     * @param {*} options
     * @returns {Series}
     */
    combine(other, callback, options){
        if(Array.isArray(other)){
            if(other.length !== this.length){
                throw new Error('Series must be of equal length')
            }
            return this.map((value, i) => callback(value, other[i], i))
        }
        else if(other instanceof Series){
            if(options && options["ignore index"]){
                if(other.length !== this.length){
                    throw new Error('Series must be of equal length')
                }
                return this.map((value, i) => callback(value, other.iloc(i), i))
            }
            const index  = this.index.union(other.index)
            const values = index.values.map(idx => {
                return this.index.has(idx) && other.index.has(idx) ? callback(this.loc(idx), other.loc(idx)) : NaN
            })
            return new Series(values, {index:index, name:this.name})
        }
        return this.map((value, i) => callback(value, other, i))
    }

    /**
     * Add a value to this series
     * If the value is a scalar, apply this addition across the series
     * If the value is a Series, values are added by index
     *     unless options["ignore axis"] == true
     *        in which case elements are added by position
     *     indices in this but not in other result in NaN
     * If the value is an array values are added by position
     * 
     * @param {*} other the value to add to this series
     * @param {*} options 
     * @returns {Series}
     */
    add(other, options){
        return this.combine(other, (a, b) => (utils.isNaN(a) || utils.isNaN(b)) ? NaN : a + b, options)
    }

    /**
     * Subtract a value from this series
     * If the value is a scalar, apply this subtraction across the series
     * If the value is a Series, values are subtracted by index
     *     unless options["ignore axis"] == true
     *        in which case elements are subtracted by position
     *     indices in this but not in other result in NaN
     * If the value is an array or Immutable.List
     *    values are subtracted by position
     * 
     * @param {*} other the value to subtract from this series
     * @param {*} options 
     * @returns {Series}
     */
    subtract(other, options){
        return this.combine(other, (a, b) => (utils.isNaN(a) || utils.isNaN(b)) ? NaN : a - b, options)
    }

    /**
     * Multiplies a value to this series
     * If the value is a scalar, apply this multiplication across the series
     * If the value is a Series, values are multiplied by index
     *     unless options["ignore axis"] == true
     *        in which case elements are multiplied by position
     *     indices in this but not in other result in NaN
     * If the value is an array or Immutable.List
     *    values are multiplied by position
     * 
     * @param {*} other the value to multiply to this series
     * @param {*} options 
     * @returns {Series}
     */
    multiply(other, options){
        return this.combine(other, (a, b) => (utils.isNaN(a) || utils.isNaN(b)) ? NaN : a * b, options)
    }

    /**
     * Divides this series by another value
     * If the value is a scalar, apply this division across the series
     * If the value is a Series, values are divided by index
     *     unless options["ignore axis"] == true
     *        in which case elements are divided by position
     *     indices in this but not in other result in NaN
     * If the value is an array or Immutable.List
     *    values are divided by position
     * 
     * @param {*} other the value to divide to this series
     * @param {*} options 
     * @returns {Series}
     */
    divide(other, options){
        return this.combine(other, (a, b) => (utils.isNaN(a) || utils.isNaN(b) || b == 0) ? NaN : a / b, options)
    }

    /**
     * Computes the modulo of this series by another value
     * If the value is a scalar, apply this modulo across the series
     * If the value is a Series, modulos are computed by index
     *     unless options["ignore axis"] == true
     *        in which case elements are computed by position
     *     indices in this but not in other result in NaN
     * If the value is an array or Immutable.List
     *    values are computed by position
     * 
     * @param {*} other the value this series is divided in to compute the modulo
     * @param {*} options 
     * @returns {Series}
     */
    mod(other, options){
        return this.combine(other, (a, b) => (utils.isNaN(a) || utils.isNaN(b) || b == 0) ? NaN : a % b, options)
    }

    /**
     * Computes the power of this series at another value
     * If the value is a scalar, apply this power across the series
     * If the value is a Series, powers are computed by index
     *     unless options["ignore axis"] == true
     *        in which case elements are computed by position
     *     indices in this but not in other result in NaN
     * If the value is an array or Immutable.List
     *    values are computed by position
     * 
     * @param {*} other the value this series is raised to
     * @param {*} options 
     * @returns {Series}
     */
    pow(other, options){
        return this.combine(other, (a, b) => (utils.isNaN(a) || utils.isNaN(b)) ? NaN : Math.pow(a, b), options)
    }

    /**
     * Computes whether this is equal to other
     * If the value is a scalar, apply this comparison across the series
     * If the value is a Series, values are compared by index
     *     unless options["ignore axis"] == true
     *        in which case elements are compared by position
     *     indices in this but not in other result in NaN
     * If the value is an array or Immutable.List
     *    values are compared by position
     * 
     * @param {*} other the value to compare this series with
     * @param {*} options 
     * @returns {Series}
     */
    equals(other, options){
        return this.combine(other, (a, b) => (options && options.strict) ? a === b : a == b, options)
    }

    /**
     * Computes whether this is not equal to other
     * If the value is a scalar, apply this comparison across the series
     * If the value is a Series, values are compared by index
     *     unless options["ignore axis"] == true
     *        in which case elements are compared by position
     *     indices in this but not in other result in NaN
     * If the value is an array or Immutable.List
     *    values are compared by position
     * 
     * @param {*} other the value to compare this series with
     * @param {*} options 
     * @returns {Series}
     */
    ne(other, options){
        return this.combine(other, (a, b) => (options && options.strict) ? a !== b : a != b, options)
    }

    /**
     * Computes whether this is greater to other
     * If the value is a scalar, apply this comparison across the series
     * If the value is a Series, values are compared by index
     *     unless options["ignore axis"] == true
     *        in which case elements are compared by position
     *     indices in this but not in other result in NaN
     * If the value is an array or Immutable.List
     *    values are compared by position
     * 
     * @param {*} other the value to compare this series with
     * @param {*} options 
     * @returns {Series}
     */
    gt(other, options){
        return this.combine(other, (a, b) => (utils.isNaN(a) || utils.isNaN(b)) ? NaN : a > b, options)
    }

    /**
     * Computes whether this is greater or equal to other
     * If the value is a scalar, apply this comparison across the series
     * If the value is a Series, values are compared by index
     *     unless options["ignore axis"] == true
     *        in which case elements are compared by position
     *     indices in this but not in other result in NaN
     * If the value is an array or Immutable.List
     *    values are compared by position
     * 
     * @param {*} other the value to compare this series with
     * @param {*} options 
     * @returns {Series}
     */
    gte(other, options){
        return this.combine(other, (a, b) => (utils.isNaN(a) || utils.isNaN(b)) ? NaN : a >= b, options)
    }

    /**
     * Computes whether this is less than other
     * If the value is a scalar, apply this comparison across the series
     * If the value is a Series, values are compared by index
     *     unless options["ignore axis"] == true
     *        in which case elements are compared by position
     *     indices in this but not in other result in NaN
     * If the value is an array or Immutable.List
     *    values are compared by position
     * 
     * @param {*} other the value to compare this series with
     * @param {*} options 
     * @returns {Series}
     */
    lt(other, options){
        return this.combine(other, (a, b) => (utils.isNaN(a) || utils.isNaN(b)) ? NaN : a < b, options)
    }

    /**
     * Computes whether this is less than or equal to other
     * If the value is a scalar, apply this comparison across the series
     * If the value is a Series, values are compared by index
     *     unless options["ignore axis"] == true
     *        in which case elements are compared by position
     *     indices in this but not in other result in NaN
     * If the value is an array or Immutable.List
     *    values are compared by position
     * 
     * @param {*} other the value to compare this series with
     * @param {*} options 
     * @returns {Series}
     */
    lte(other, options){
        return this.combine(other, (a, b) => (utils.isNaN(a) || utils.isNaN(b)) ? NaN : a <= b, options)
    }

    /**
     * Computes whether this and other are true
     * If the value is a scalar, apply this comparison across the series
     * If the value is a Series, values are compared by index
     *     unless options["ignore axis"] == true
     *        in which case elements are compared by position
     *     indices in this but not in other result in NaN
     * If the value is an array or Immutable.List
     *    values are compared by position
     * 
     * @param {*} other the value to compare this series with
     * @param {*} options 
     * @returns {Series}
     */
    and(other, options){
        return this.combine(other, (a, b) => (a == true && b == true) ? true : false, options)
    }

    /**
     * Computes whether this or other are true
     * If the value is a scalar, apply this comparison across the series
     * If the value is a Series, values are compared by index
     *     unless options["ignore axis"] == true
     *        in which case elements are compared by position
     *     indices in this but not in other result in NaN
     * If the value is an array or Immutable.List
     *    values are compared by position
     * 
     * @param {*} other the value to compare this series with
     * @param {*} options 
     * @returns {Series}
     */
    or(other, options){
        return this.combine(other, (a, b) => (a == true || b == true) ? true : false, options)
    }

    /**
     * Filter a series by an iterable
     * 
     * @param {Series|Array} other 
     * @param {*} options options to pass to this.combine
     * @returns {Series}
     */
    mask(other, options){
        if(!(other instanceof Series)){
            other = this.combine(other, (a, b) => b == true, options)
        }
        return this.filter((value, i) => other.loc(this.index.at(i)), options)
    }

    /**
     * Replaces values in this by values in other if test fails
     * 
     * @param {function} test the test func 
     * @param {Series} other the other series
     * @param {*} options if other is a Series and options["ignore index"], replacement is by position
     * @returns {Series}
     */
    where(callback, other, options){
        return this.combine(other, (a, b, i) => callback(a, i) ? a : b, options)
    }

    /**
     * Computes the change over a number of periods
     * 
     * @param {number} periods 
     * @returns {Series}
     */
    diff(offset = 1){
        if(utils.isNaN(offset) || !Number.isInteger(offset)){
            throw new Error('Offset should be an integer')
        }
        if(offset >= 0){ 
            return this.map((value, i) => i >= offset ? (utils.isNaN(value) || utils.isNaN(this._values[i-offset]) ? NaN : value - this._values[i-offset]) : NaN)
        }
        return this.map((value, i) => (i - offset) < this.length ? (utils.isNaN(value) || utils.isNaN(this._values[i-offset])) ? NaN : value - this._values[i-offset] : NaN)
    }

    /**
     * Computes the percentage changes over a number of periods
     * 
     * @param {number} periods 
     * @returns {Series}
     */
    returns(offset = 1){
        if(utils.isNaN(offset) || !Number.isInteger(offset)){
            throw new Error('Offset should be an integer')
        }
        if(offset >= 0){ 
            return this.map((value, i) => i >= offset ? (utils.isNaN(value) || utils.isNaN(this._values[i-offset]) ? NaN : value / this._values[i-offset] - 1) : NaN)
        }
        return this.map((value, i) => (i - offset) < this.length ? (utils.isNaN(value) || utils.isNaN(this._values[i-offset])) ? NaN : value / this._values[i-offset] - 1 : NaN)
    }

    /**
     * Shifts the values relative to the index by an offset 
     * 
     * @param {number} [offset=0] the number of periods to shift
     * @returns {Series}
     */
    shift(offset = 0){
        if(utils.isNaN(offset) || !Number.isInteger(offset)){
            throw new Error('Offset should be an integer')
        }
        if(offset >= 0){
            return this.map((v, i) => i >= offset ? this._values[i-offset] : NaN)
        }
        return this.map((v, i) => i - offset < this.length ? this._values[i-offset] : NaN)
    }

    /**
     * Fill non-numeric values
     * 
     * @param {options} options how to fill non-numeric values
     * @returns {Series}
     */
    fillnan(options){
        if(options && options.method == "ffill"){
            return this.accumulate((prev, curr) => utils.isNaN(curr) ? prev : curr)
        }
        else if(options && options.method == "bfill"){
            return this.reverse().fillnan({method:"ffill"}).reverse()
        }
        else if(options && "value" in options){
            return this.accumulate((prev, curr) => utils.isNaN(curr) ? options.value : curr)
        }
        throw new Error('fillna must be provided with a method or a value')
    }

    /**
     * Fill missing values
     * 
     * @param {options} options how to fill missing values
     * @returns {Series}
     */
    fillna(options){
        if(options && options.method == "ffill"){
            return this.accumulate((prev, curr) => utils.isNA(curr) ? prev : curr)
        }
        else if(options && options.method == "bfill"){
            return this.reverse().fillna({method:"ffill"}).reverse()
        }
        else if(options && "value" in options){
            return this.accumulate((prev, curr) => utils.isNA(curr) ? options.value : curr)
        }
        throw new Error('fillna must be provided with a method or a value')
    }

    /**
     * Returns the value at a given label
     * If the label does not exist, return the value at the label immediately below it
     * 
     * @param {*} label 
     * @param {*} options 
     */
    asof(label){
        if(this.length == 0){
            throw new Error("series is empty")
        }
        return this._values[this.index.loc(this.index.asof(label))]
    }

    /**
     * Converts the series to a given data type
     * 
     * @param {string} dtype 
     * @returns {Series}
     */
    astype(dtype){
        if(dtype == "string"){
            return this.map((value) => String(value))
        } 
        else if(dtype == "number"){
            return this.map((value) => Number(value))
        }
        else if(dtype == "boolean"){
            return this.map((value) => Boolean(value))
        }
        else if(dtype == "object"){
            return this.map(value => value)
        }
        else{
            throw new Error("Invalid dtype, " + dtype + " given")
        }
    }

    /**
     * Sorts the series either by its index or by values
     * 
     * @param {*} options
     */
    sort(options){
        let [index, values] = [null, null]

        if(options === undefined || options.by === undefined || options.by == "values"){
            [ index, values ] = this.items.sort((a, b) => {
                return utils.defaultsort(a[1], b[1], {na:(options ? options.na : "last")})
            }).reduce((acc, curr) => {
                acc[0].push(curr[0])
                acc[1].push(curr[1])
                return acc
            },[[],[]])
        }
        else if(options.by == "index"){
            index  = this.index.sort()
            values = index._values.map(idx => this.loc(idx))  
        }

        if(options && options.ascending === false){
            index  = index.reverse()
            values = values.reverse()
        }

        if(options && options.inplace){
            this.index  = index
            this.values = values
            return
        }
        
        return new Series(values, {index:index, name:this.name})
    }

    /**
     * Returns the rank of the values
     * 
     * @param {*} options 
     */
    rank(options){
        const sorted = this.sort(options)
        const count  = (options && options.normalized) ? this.count() : 1
        const values = this.index._values.map(idx => utils.isNA(this.loc(idx)) ? NaN : (sorted.index.indexOf(idx) + 1) / count)
        return new Series(values, {index: this.index, name:this.name})
    }

    /**
     * Returns the quantile value
     * 
     * @param {float} p 
     */
    quantile(p){
        const values = [...this._values].filter(v => !utils.isNaN(v)).sort(utils.defaultsort)
        if(values.length == 0) return NaN
        return values[Math.max(0, Math.round(p * values.length) - 1)]
    }

    /**
     * Returns the median of the values
     */
    median(){
        return this.quantile(0.5)
    }

    /**
     * Group values by 
     * @param {*} options 
     * @returns SeriesGroupby
     */
    groupby(by, options){
        if(typeof by == "function"){
            return new SeriesGroupby(this, {...options, grouper:by})
        }
        if(utils.isIterable(by)){
            if(by.length != this.length){
                throw new Error("length of groups should match series length")
            }
            return new SeriesGroupby(this, {...options, grouper:(groups => {
                return (value, i) => groups[i]
            })([...groups])})
        }
        throw new Error("Series.groupby called incorrectly")
    }

    /**
     * Drop rows where label in labels
     * TODO should be able to pass a single label
     * 
     * @param {Array} labels 
     * @param {} axis 
     * @returns {Series}
     */
    drop(labels){
        return this.filter((value, i) => {
            return labels.indexOf(this.index.iloc(i)) == -1
        })
    }

    /**
     * Returns whether the series' values are in the list of values
     * 
     * @param {*} values 
     */
    isin(values){
        return this.map((value, i) => {
            return values.indexOf(value) != -1
        })
    }

    /**
     * Converts the series to string, formatting toFixed
     * 
     * @param {number} [n=0] the number of significant digits 
     */
    toFixed(n = 0){
        return this.astype("number").map((value, i) => {
            return value.toFixed(n)
        })
    }

    /**
     * Reindex the series
     * 
     * @param {*} index 
     */
    reindex(index, options){
        const values = [...index].map((idx, i, index) => {
            if(this.index.has(idx)){
                return this.loc(idx)
            }
            if(options && options.fillna == "ffill"){
                //get the most recent value which is strictly after the previous index
                if(this.index.sorted == "ascending" && idx >= this.index.at(0)){
                    if(i == 0 || this.index.asof(idx) > index[i-1]){
                        return this.asof(idx)
                    }
                    return NaN
                }
            }
            return NaN
        })
        return new Series(values, {index:index, name:this.name})
    }

    /**
     * Resample to a given frequency
     */
    resample(frequency, options){
        const groups = this.index._values.map(date => {
            switch(frequency){
                case "D":
                    return moment(date).endOf("day").valueOf()
                case "W": 
                    return moment(date).endOf("week").startOf("day").valueOf()
                case "M":
                    return moment(date).endOf("month").startOf("day").valueOf()
                case "Q":
                    return moment(date).endOf("quarter").startOf("day").valueOf()
                case "Y":
                    return moment(date).endOf("year").startOf("day").valueOf()
            }
        })
        return this.groupby(groups)
    }

    /**
     * Create a pivot table from the series
     * 
     * @param {*} options 
     */
    pivot(options){
        //function that accepts (value, i) and return {index, column}
        const grouper = (options => {
            const callbacks = ["index", "columns"].map(axis => {
                if(options && options[axis]){
                    //if the options is already a function
                    if(typeof options[axis] == "function"){
                        return options[axis]
                    }
                    //if it is an iterable, convert to function
                    if(utils.isIterable(options[axis])){
                        if(!options[axis].length != this.length){
                            throw new Error(`pivot ${axis} length should equal series length`)
                        }
                        return (groups => (v, i) => groups[i])([...options[axis]])
                    }
                }
                throw new Error(`${axis} missing from pivot options`)
            })
            return (value, i) => {
                return {index:callbacks[0](value, i), column:callbacks[1](value, i)}
            }
        })(options)

        return new Pivot(this, {grouper})
    }

    /**
     * Apply a rolling function to the series
     * @param {*} options 
     */
    rolling(options){
        return new Rolling(this, options)
    }
}