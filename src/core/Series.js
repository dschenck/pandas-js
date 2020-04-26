import { Axis }   from './Axes'
import * as utils from './utils'

export class Series{
    constructor(data, options){
        if(data instanceof Series){
            this._values = data.values
            this._name   = data.name
            this._index  = data.index
        }
        else if(Array.isArray(data)){
            this._values = [...data]
        }
        else if(data === undefined){
            this._values = []
        }
        else if(typeof data == "object"){
            if(data.data){
                return new Series(data.data, {name:data.name, index:data.index})
            }
        }
        else{ 
            throw new TypeError('Could not parse the data')
        }
        if(options && options.name){
            this._name = options.name
        }
        if(options && options.index){
            this._index = new Axis(options.index)
            if(this._index.length != this._values.length){
                throw new Error('Index and data are of different length')
            }
        }
        else{
            this._index = new Axis(utils.range(this._values.length))
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
     * Sets a new index
     */
    set index(indices){
        indices = new Axis(indices)
        if(indices.length != this.length){
            throw new Error('Length mismatch error')
        }
        this._index = indices
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
     * Returns a new renamed series
     * If options.inplace, then the operation is in-place
     *    and returns nothing
     * 
     * @param {*} name the new name
     * @param {*} options options.inplace to change operation to inplace
     */
    rename(name, options){
        if(options && options.inplace){
            this._name = name
            return
        }
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
        if(utils.ismappable(labels)){
            return new Series(labels.map(label => this.loc(label), {name:this.name, index:labels}))
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
        if(utils.ismappable(indices)){
            return new Series(indices.map(i => this.iloc(i)), {name:this.name, index:indices.map(i => this.index.at(i))})
        }
        if(indices >= this.length || (this.length + indices) < 0){
            throw new Error('Out of bounds error')
        }
        return this._values[indices >= 0 ? indices : this.length + indices]
    }
    /**
     * Slices the series by position (index)
     * The upper bound is excluded
     * 
     * @param {number} begin the index (0-based) of the beginning of the slice
     * @param {number} [end=undefined] the index (0-based) of the end of the slice, excluded 
     * @returns {Series}
     */
    slice(start, stop){
        if(start > this.length || (this.length + start) < 0){
            throw new Error('Out of bounds error')
        }
        if(stop && (stop > this.length || (this.length + stop) < 0)){
            throw new Error('Out of bounds error')
        }
        return new Series(this._values.slice(start, stop), {name:this.name, index:this.index.slice(start, stop)})
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
     * The index is not reversed
     * e.g. first > last
     * 
     * @param {*} options options.inplace changes the values in-place
     * @returns {Series} 
     */
    reverse(options){
        if(options && options.inplace){
            this._values = [...this._values].reverse()
            this._index  = this.index
            return
        }
        return new Series([...this._values].reverse(), {name:this.name, index:this.index})
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
     * Filters a series using a filtering function
     * Only values where the function returns true are kept
     * 
     * @param {function} func 
     * @param {*} options 
     * @returns {Series}
     */
    filter(func, options){
        const mask = this._values.map((value, i) => func(value, i))
        if(options && options.inplace){
            this._values = this._values.filter((value, i) => mask[i])
            return
        }
        return new Series(
            this._values.filter((value, i) => mask[i]), 
            {name:this.name, index:this.index.filter((v, i) => mask[i])
        })
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
     * Filter a series by an iterable
     * 
     * @param {Series|Array} other 
     * @param {*} options options to pass to this.combine
     * @returns {Series}
     */
    mask(other, options){
        if(other instanceof Series || Array.isArray(other)){
            const mask = this.combine(other, (a, b, i) => {
                return b == true
            }, options).values
            return this.filter((value, i) => mask[i])
        }
        throw new Error('Could not mask with other')
    }

    /**
     * Returns a boolean series flagging non-numeric types
     * 
     * @returns {Series}
     */
    isNaN(){
        return this.map((value) => {
            return utils.isNaN(value)
        })
    }

    /**
     * Returns a boolean series flagging missing values
     * 
     * @returns {Series}
     */
    isNA(){
        return this.map((value) => {
            return utils.isNA(value)
        })
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
     * Computes the boolean inverse of the series
     * true -> false and false -> true
     * @returns {Series}
     */
    not(){
        return this.map((value) => !value)
    }

    /**
     * Computes the sum of the series
     * 
     * @param {boolean} [skipnan=true] whether to ignore non-numeric values
     * @returns {number|NaN}
     */
    sum(skipnan = true){
        return this._values.reduce((prev, curr) => {
            if(skipnan === false){
                return utils.isNaN(curr) ? NaN : prev + curr
            }
            return utils.isNaN(curr) ? prev : prev + curr
        }, 0)
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
        return this._values.reduce((prev, curr) => {
            if(skipnan === false){
                return utils.isNA(curr) ? prev : prev + 1
            }
            return utils.isNaN(curr) ? prev : prev + 1
        }, 0)
    }

    /**
     * Computes the mean (average) of the series
     * 
     * @param {boolean} [skipnan=true] whether to average only numeric values
     * @returns {number|NaN}
     */
    mean(skipnan = true){
        const count = this.count(skipnan)
        if(count == 0) return NaN
        return this.sum(skipnan) / this.count(skipnan)
    }

    /**
     * Applies a function cum, passing the previous result and current value
     * 
     * @param {function} reducer function reduces prev and current value to value
     * @param {*} [initially=undefined] function or value to initialize the first entry
     * @returns {Series}
     */
    cum(reducer, initially = NaN){
        let values = []
        for(let i = 0, len = this.length; i < len; i++){
            if(i == 0){
                if(arguments.length == 2){
                    if(typeof initially == "function"){
                        values.push(initially(this._values[0]))
                    }
                    else{
                        values.push(initially)
                    }
                }
                else {
                    values.push(NaN)
                }
            }
            else{
                values.push(reducer(values[i-1], this._values[i]))
            }
        }
        return new Series(values, {index:this.index, name:this.name})
    }
    /**
     * Returns the cumulative sum of the series, starting at 0 
     * Ignoring non-numeric values assumes them equal to 0
     * Until a numeric value is encountered, the cumulative sum is NaN
     * 
     * @param {boolean} [skipnan=true] whether to ignore non-numeric values
     */
    cumsum(skipnan = true){
        return this.cum((prev, curr) => {
            if(skipnan){
                if(utils.isNaN(curr)){
                    return prev
                }
                return utils.isNaN(prev) ? curr : prev + curr
            }
            return prev + curr
        }, (value) => {
            return utils.isNaN(value) ? NaN : value
        })
    }
    /**
     * Returns the cumulative product of the series, starting at 1 
     * Ignoring non-numeric values assumes them equal to 1
     * Until a numeric value is encountered, the cumulative product is NaN
     * 
     * @param {boolean} [skipnan=true] whether to ignore non-numeric values
     */
    cumprod(skipnan = true){
        return this.cum((prev, curr) => {
            if(skipnan){
                if(utils.isNaN(curr)){
                    return prev
                }
                return utils.isNaN(prev) ? curr : prev * curr
            }
            return prev + curr
        }, (value) => {
            return utils.isNaN(value) ? NaN : value
        })
    }
    /**
     * Returns the cumulative maximum of the series 
     * Until a numeric value is encountered, the cumulative maximum is NaN
     * 
     * @param {boolean} [skipnan=true] whether to ignore non-numeric values
     */
    cummax(skipnan = true){
        return this.cum((prev, curr) => {
            if(skipnan){
                if(utils.isNaN(curr)){
                    return prev
                }
                return utils.isNaN(prev) ? curr : (prev > curr ? prev : curr)
            }
            if(utils.isNaN(curr)){
                return NaN
            }
            return curr > prev ? curr : prev
        }, (value) => {
            return utils.isNaN(value) ? NaN : value
        })
    }
    /**
     * Returns the cumulative minimum of the series 
     * Until a numeric value is encountered, the cumulative maximum is NaN
     * 
     * @param {boolean} [skipnan=true] whether to ignore non-numeric values
     */
    cummin(skipnan = true){
        return this.cum((prev, curr) => {
            if(skipnan){
                if(utils.isNaN(curr)){
                    return prev
                }
                return utils.isNaN(prev) ? curr : (prev < curr ? prev : curr)
            }
            if(utils.isNaN(curr)){
                return NaN
            }
            return prev > curr ? curr : prev
        }, (value) => {
            return utils.isNaN(value) ? NaN : value
        })
    }
    /**
     * Computes the cumulative compound of the series
     * Ignoring non-numeric values assumes them equal to 0
     * Until a numeric value is found, the cumulative compound is NaN
     * 
     * @param {boolean} [skipnan=true] whether to ignore non-numeric values
     * @returns {Series}
     */
    cumcompound(skipnan = true){
        return this.cum((prev, curr) => {
            if(skipnan){
                if(utils.isNaN(curr)){
                    return prev
                }
                return utils.isNaN(prev) ? curr : (1 + prev) * (1 + curr) - 1
            }
            return (1 + prev) * (1 + curr) - 1
        }, (value) => {
            return utils.isNaN(value) ? NaN : value
        })
    }
    /**
     * Computes the absolute value of each element in the series
     * 
     * @returns {Series}
     */
    abs(){
        return this.map((value, i) => {
            if(utils.isNaN(value)){
                return NaN
            }
            return Math.abs(value)
        })
    }
    /**
     * Compute the negative of each element in the series
     * This is not the inverse of .abs()
     * 
     * @returns {Series}
     */
    neg(){
        return this.map((value, i) => {
            if(utils.isNaN(value)){
                return NaN
            }
            return -value
        })
    }
    /**
     * Combine this series with another iterable
     * 
     * @param {*} other 
     * @param {*} func 
     * @param {*} options
     * @returns {Series}
     */
    combine(other, func, options){
        if(other instanceof Series){
            if(options && options["ignore index"]){
                if(other.length !== this.length){
                    throw new Error('Series must be of equal length')
                }
                return this.map((value, i) => func(value, other.iloc(i), i))
            }
            return this.map((value, i) => {
                try{
                    return func(value, other.loc(this.index.iloc(i)), i)
                }
                catch {
                    return NaN
                }
            })
        }
        else if(Array.isArray(other)){
            if(other.length !== this.length){
                throw new Error('Series must be of equal length')
            }
            return this.map((value, i) => func(value, other[i], i))
        }
        return this.map((value, i) => func(value, other, i))
    }
    /**
     * Add a value to this series
     * If the value is a scalar, apply this addition across the series
     * If the value is a Series, values are added by index
     *     unless options["ignore axis"] == true
     *        in which case elements are added by position
     *     indices in this but not in other result in NaN
     * If the value is an array or Immutable.List
     *    values are added by position
     * 
     * @param {*} other the value to add to this series
     * @param {*} options 
     * @returns {Series}
     */
    add(other, options){
        return this.combine(other, (a, b) => {
            const res = a + b
            if(utils.isNaN(res)){
                return NaN
            }
            return res
        }, options)
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
        return this.combine(other, (a, b) => {
            const res = a - b
            if(utils.isNaN(res)){
                return NaN
            }
            return res
        }, options)
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
        return this.combine(other, (a, b) => {
            const res = a * b
            if(utils.isNaN(res)){
                return NaN
            }
            return res
        }, options)
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
        return this.combine(other, (a, b) => {
            const res = a / b
            if(utils.isNaN(res)){
                return NaN
            }
            return res
        }, options)
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
        return this.combine(other, (a, b) => {
            const res = a % b
            if(utils.isNaN(res)){
                return NaN
            }
            return res
        }, options)
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
        return this.combine(other, (a, b) => {
            const res = Math.pow(a, b)
            if(utils.isNaN(res)){
                return NaN
            }
            return res
        }, options)
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
        return this.combine(other, (a, b) => {
            if(utils.isNaN(a) || utils.isNaN(b)){
                return NaN
            }
            if(options && options.strict){
                return a === b
            }
            return a == b
        }, options)
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
        return this.combine(other, (a, b) => {
            if(utils.isNaN(a) || utils.isNaN(b)){
                return NaN
            }
            if(options && options.strict){
                return a !== b
            }
            return a != b
        }, options)
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
        return this.combine(other, (a, b) => {
            if(utils.isNaN(a) || utils.isNaN(b)){
                return NaN
            }
            return a > b
        }, options)
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
        return this.combine(other, (a, b) => {
            if(utils.isNaN(a) || utils.isNaN(b)){
                return NaN
            }
            return a >= b
        }, options)
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
        return this.combine(other, (a, b) => {
            if(utils.isNaN(a) || utils.isNaN(b)){
                return NaN
            }
            return a < b
        }, options)
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
        return this.combine(other, (a, b) => {
            if(utils.isNaN(a) || utils.isNaN(b)){
                return NaN
            }
            return a <= b
        }, options)
    }
    /**
     * Compute the maximum of the series
     * 
     * @param {boolean} skipnan whether to ignore non-numeric values
     * @returns {number|NaN}
     */
    max(skipnan = true){
        return this.astype("number").values.reduce((prev, curr) => {
            if(skipnan){
                if(utils.isNaN(curr)){
                    return prev
                }
                if(utils.isNaN(prev)){
                    return utils.isNaN(curr) ? NaN : curr
                }
                return curr > prev ? curr : prev
            }
            if(prev == null){
                return utils.isNaN(curr) ? NaN : curr
            }
            if(utils.isNaN(prev)){
                return NaN
            }
            return utils.isNaN(curr) ? NaN : (curr > prev ? curr : prev)
        }, null)
    }
    /**
     * Compute the maximum of the series
     * 
     * @param {boolean} skipnan whether to ignore non-numeric values
     * @returns {number|NaN}
     */
    min(skipnan = true){
        return this.astype("number").values.reduce((prev, curr) => {
            if(skipnan){
                if(utils.isNaN(curr)){
                    return prev
                }
                if(utils.isNaN(prev)){
                    return utils.isNaN(curr) ? NaN : curr
                }
                return curr < prev ? curr : prev
            }
            if(prev == null){
                return utils.isNaN(curr) ? NaN : curr
            }
            if(utils.isNaN(prev)){
                return NaN
            }
            return utils.isNaN(curr) ? NaN : (curr < prev ? curr : prev)
        }, null)
    }

    

    /**
     * Replaces values in this by values in other if test fails
     * 
     * @param {function} test the test func 
     * @param {Series} other the other series
     * @param {*} options if other is a Series and options["ignore index"], replacement is by position
     * @returns {Series}
     */
    where(test, other, options){
        return this.combine(other, (a, b, i) => {
            if(test(a, i)) return a
            return b
        }, options)
    }

    /**
     * Return a new series where missing values have been dropped
     * 
     */
    dropna(){
        return this.filter((value, i) => {
            return !utils.isNA(value)
        })
    }

    /**
     * Return a new series where non-numeric values have been dropped
     * 
     */
    dropnan(){
        return this.mask(this.isNaN().not())
    }
    
    /**
     * Fill missing values
     * 
     * @param {options} options how to fill missing values
     * @returns {Series}
     */
    fillna(options){
        if(options && options.method == "ffill"){
            return this.cum((prev, curr) => {
                return utils.isNA(curr) ? prev : curr
            }, (value) => utils.isNA(value) ? NaN : value)
        }
        else if(options && options.method == "bfill"){
            return this.reverse().fillna({method:"ffill"}).reverse()
        }
        else if(options && options.hasOwnProperty("value")){
            return this.cum((prev, curr) => {
                if(utils.isNA(curr)){
                    return options.value
                }
                return curr
            }, (value) => utils.isNA(value) ? NaN : value)
        }
        throw new Error('fillna must be provided with a method or a value')
    }
    /**
     * Fill non-numeric values
     * 
     * @param {options} options how to fill non-numeric values
     * @returns {Series}
     */
    fillnan(options){
        if(options && options.method == "ffill"){
            return this.cum((prev, curr) => {
                if(utils.isNaN(curr)){
                    return prev
                }
                return curr
            }, () => NaN)
        }
        else if(options && options.method == "bfill"){
            return this.reverse().fillnan({method:"ffill"}).reverse()
        }
        else if(options && options.hasOwnProperty("value")){
            return this.cum((prev, curr) => {
                if(utils.isNaN(curr)){
                    return options.value
                }
                return prev
            }, () => NaN)
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
    asof(label, options){
        const loc = this.index.asof(label, options)
        return this._values[this.index.loc(loc)]
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
     * Computes the change over a number of periods
     * 
     * @param {number} periods 
     * @returns {Series}
     */
    diff(periods = 1){
        if(periods > 0){
            return this.map((value, i) => {
                if(i - periods < 0){
                    return NaN
                }
                return this._values[i] - this._values[i - periods]
            })
        }
        return this.map((value, i) => {
            if(i - periods >= this.length){
                return NaN
            }
            return this._values[i] - this._values[i - periods]
        })
    }

    /**
     * Shifts the values relative to the index by an offset 
     * 
     * @param {number} [offset=0] the number of periods to shift
     * @param {*} [fill=NaN] the fill values for the first/last offset values
     * @returns {Series}
     */
    shift(offset = 0, fill = NaN){
        if(utils.isNaN(offset) || !Number.isInteger(offset)){
            throw new Error('Offset should be an integer')
        }
        if(offset > 0){
            return this.map((value, i) => {
                if(i < offset){
                    return fill
                }
                return this._values[i-offset]
            })
        }
        else if(offset < 0){
            return this.map((value, i) => {
                if(i >= (this.length + offset)){
                    return fill
                }
                return this._values[i-offset]
            })
        }
        return this.copy()
    }
    /**
     * Filter every n-periods
     * 
     * @param {number} period 
     * @returns {Series}
     */
    every(period = 1){
        return this.filter((value, i) => {
            return i % period == 0
        })
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
     * Positional index of the first encounter of the maximum
     * 
     * @returns {number|NaN}
     */
    idxmax(){
        const max = this.max()
        for(let i = 0, len = this.length; i < len; i++){
            if(this._values[i] == max){
                return this.index.iloc(i)
            }
        }
        return NaN
    }

    /** 
     * Positional index of the first encounter of the minimum
     * 
     * @returns {number|NaN}
     */
    idxmin(){
        const min = this.min()
        for(let i = 0, len = this.length; i < len; i++){
            if(this._values[i] == min){
                return this.index.iloc(i)
            }
        }
        return NaN
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
}