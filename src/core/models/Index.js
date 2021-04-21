import datetime   from '../libs/datetime'
import bisect     from '../libs/bisect' 
import * as utils from '../utils'
import stats      from '../stats'
import Series     from './Series'

export default class Index{ 
    constructor(values, options){
        if(values instanceof Index){
            this._values  = values._values
            this._options = {...values.options, ...options}
            return this
        }
        if(values === undefined){
            this._values = []
        }
        else if(utils.isIterable(values)){
            this._values = [...values]
        }
        else{
            throw new Error("Expected values to be an iterable")
        }
        if(options){
            this._options = {...options}
        }
        else{
            this._options = {}
        }
    }

    /**
     * Returns the values of the index as a native array
     */
    get values(){
        return [...this._values]
    }

    /**
     * Returns a Map mapping keys to their positions
     */
    get keymap(){
        if(!this._options.keymap){
            this._options.keymap = new Map(this._values.map((key, i) => [key, i]))
        }
        return this._options.keymap
    }

    /**
     * Returns the name of the index (or undefined)
     */
    get name(){
        return this._options.name
    }

    /**
     * Returns true if the index is natively sortable
     */
    get sortable(){
        return this.numeric || this.categorical
    }

    /**
     * Returns one of false, 'ascending' or 'descending'
     */
    get sorted(){
        if(this._options.sorted === undefined){
            if(this.length == 0){
                throw new Error("empty indices cannot be sorted")
            }
            if(this.sortable){
                if(this._values.reduce((acc, curr, i) => {
                    return acc && (i == 0 || curr >= this._values[i-1])
                }, true)){
                    this._options.sorted = "ascending"
                }
                else if(this._values.reduce((acc, curr, i) => {
                    return acc && (i == 0 || curr <= this._values[i-1])
                }, true)){
                    this._options.sorted = "descending"
                }
                else{
                    this._options.sorted = false
                }
            }
            else{
                this._options.sorted = false
            }
        }
        return this._options.sorted
    }

    /**
     * Returns the size of the index
     */
    get length(){
        return this._values.length
    }

    /**
     * Returns true if the index is empty
     */
    get empty(){
        return this.length == 0
    }

    /**
     * Returns the options
     */
    get options(){
        return {...this._options}
    }

    /**
     * Returns true if the index contains only unique values
     */
    get unique(){
        return this.keymap.size == this.length
    }

    /**
     * Returns true if the index contains numeric values only
     */
    get numeric(){
        if(this.length == 0){
            throw new Error("unable to determine datatype of empty index")
        }
        if(this._options.numeric === undefined){
            this._options.numeric = this._values.every(v => {
                return utils.isNumeric(v)
            })
        }
        return this._options.numeric
    }

    /**
     * Returns true if the index contains string values only
     */
    get categorical(){
        if(this.length == 0){
            throw new Error("unable to determine datatype of empty index")
        }
        if(this._options.categorical === undefined){
            this._options.categorical = this._values.every(v => {
                return utils.isString(v)
            })
        }
        return this._options.categorical
    }

    /**
     * Iteration protocol
     */
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
     * Returns a new axis
     */
    copy(){
        return new Index(this._values, this.options)
    }

    /**
     * Returns true if the key is in the axis
     * @param {*} key 
     */
    has(key){
        return this.keymap.has(key)
    }

    /**
     * Returns the 0-based position of the key in the axis
     * @param {*} key 
     */
    indexOf(key){
        if(!this.unique){
            throw new Error("indexOf requires index to have unique values only")
        }
        if(this.has(key)){
            return this.keymap.get(key)
        }
        throw new Error(`key ${key} not in axis`)
    }

    /**
     * Returns a new axis with the position of the passed keys
     * If the keys is a mappable object, then it returns a new 
     * index with the position of each of the passed key
     * 
     * @param {*} keys 
     */
    loc(keys){
        if(utils.isIterable(keys) && !utils.isString(keys)){
            return new Index(keys.map(key => this.indexOf(key)), {name:this.name})
        }
        return this.indexOf(keys)
    }

    /**
     * 
     * @param {*} index 
     */
    at(index){
        if(utils.isNaN(index) || !Number.isInteger(index)){
            throw new Error('index should be an integer')
        }
        if(index >= this.length || (this.length + index) < 0){
            throw new Error(`index is out of bounds (index is ${this.length} long, ${index} given)`)
        }
        return index < 0 ? this._values[this.length + index] : this._values[index] 
    }

    /**
     * Returns the largest value in the index 
     * less than the given label
     */ 
    asof(value){
        if(!this.sortable){
            throw new Error("asof requires a sortable index")
        }
        if(!this.sorted){
            throw new Error("asof requires a sorted index")
        }
        if(this.keymap.has(value)){
            return value
        }
        if(this.sorted == "ascending"){
            if(value < this.at(0)){
                throw new Error(`value is out of bounds (${value} is lower than the smallest value of the index)`)
            }
            if(value > this.at(this.length - 1)){
                return this.at(this.length - 1)
            }
            return bisect.asof(this._values, value)
        }
        else{
            if(value < this.at(this.length - 1)){
                throw new Error(`value is out of bounds (${value} is lower than the smallest value of the index)`)
            }
            if(value > this.at(0)){
                return this.at(0)
            }
            return bisect.asof([...this._values].reverse(), value)
        }
    }

    /**
     * Returns the label at the index
     * If given an iterable, then 
     * @param {*} indices 
     */
    iloc(indices){
        if(utils.isIterable(indices)){
            return new Index(indices.map(i => this.at(i)), {name:this.name})
        }
        return this.at(indices)
    }

    /**
     * Slices an index by value
     * Exclusive of upper bound
     * 
     * @param {*} start 
     * @param {*} stop 
     */
    slice(start, stop){
        start = utils.isDefined(start) ? start : this.at(0) 
        if(utils.isDefined(stop)){
            return this.filter(v => (v >= start) && (v < stop))
        }
        return this.filter(v => v >= start)
    }

    /**
     * Slices an index by position 
     * Exclusive of upper bound
     * 
     * @param {integer} start 
     * @param {integer} end 
     */
    islice(start, stop){
        if(start > this.length || (this.length + start) < 0){
            throw new Error('Out of bounds error')
        }
        if(stop && (stop > this.length || (this.length + stop) < 0)){
            throw new Error('Out of bounds error')
        }
        return new Index(this._values.slice(start, stop), {name:this.name})
    }
    
    /**
     * Renames the index 
     * 
     * @param {*} name 
     * @param {*} options 
     */
    rename(name){
        return new Index(this._values, {...this.options, name:name})
    }
    
    /**
     * Sort the index 
     * 
     * @param {*} func sorting function
     */
    sort(func){
        if(func === undefined){
            if(!this.sortable){
                throw new Error("sort requires a sortable index; alternatively, pass a comparison function")
            }
            return new Index(
                this.values.sort((a, b) => a < b ? -1 : 1), 
                {...this.options, sorted:"ascending"}
            )
        }
        return new Index(this.values.sort(func), {...this.options})
    }

    /**
     * Reverse the index (first to last)
     */
    reverse(){
        if(this.length == 0){
            return new Index([], {name:this.name})
        }
        if(this.sorted == "ascending"){
            return new Index(this.values.reverse(), {...this.options, sorted:"descending"})
        }
        if(this.sorted == "descending"){
            return new Index(this.values.reverse(), {...this.options, sorted:"ascending"})
        }
        return new Index(this.values.reverse(), this.options)
    }

    /**
     * Returns a new series mapping this index to a new series
     * 
     * @param {*} func 
     */
    map(func){
        return new Index(this._values.map(func), {name:this.name})
    }

    /**
     * Filters the index by a callback
     */
    filter(func){
        return new Index(this._values.filter(func), {name:this.name})
    }

    /**
     * Returns the max of the index
     */
    max(){
        if(this.length == 0){
            throw new Error("Cannot compute max of empty index")
        }
        if(!this.sortable){
            throw new Error("Cannot compute max on non-sortable index")
        }
        return stats.max(this._values)
    }

    /**
     * Returns the min of the index
     */
    min(){
        if(this.length == 0){
            throw new Error("Cannot compute min of empty index")
        }
        if(!this.sortable){
            throw new Error("Cannot compute min on non-sortable index")
        }
        return stats.min(this._values)
    }

    /**
     * Returns the 0-based index of the minimum value in the index
     */
    idxmin(){
        return this.indexOf(this.min())
    }

    /**
     * Returns the 0-based index of the maximum value in the index
     */
    idxmax(){
        return this.indexOf(this.max())
    }

    /**
     * Combines this index with another iterable to create a new axis 
     * 
     * @param {*} other 
     */
    concat(other){
        return new Index(this._values.concat([...other]), {name:this.name})
    }

    /**
     * Filters this with another iterable of boolean values
     * 
     * @param {*} mask 
     */
    mask(mask){
        if(mask.length != this.length){
            throw new Error("Mask should be of the same length as the axis")
        }

        return new Index(
            [...mask].map((value, i) => {
                return value ? i : -1
            }).filter(value => {
                return value !== -1
            }).map(i => this._values[i]), 
            {name:this.name}
        )
    }

    /**
     * Make new Index with passed list of labels deleted.
     */
    drop(labels){
        if(utils.isIterable(labels) && !utils.isString(labels)){
            return this.filter(v => labels.indexOf(v) == -1)
        }
        return this.filter(v => v != labels)
    }

    /**
     * Create a new index from a list of others
     * @param {*} others 
     */
    static union(others, options){
        if(!Array.isArray(others) || !others.every(utils.isIterable)){
            throw new Error("(static) union expected a list of iterables")
        }
        const values = others.reduce((acc, curr) => {
            return new Set([...acc, ...curr])
        }, new Set())

        const index = new Index(values, options)

        if(!options || options.sort === undefined){
            return index.sortable ? index.sort() : index
        }
        if(options.sort){
            return index.sort()
        }
        return index
    }

    /**
     * Creates a new index combining the values of this and another iterable
     * The new index is sorted in ascending order
     * 
     * @param {*} other 
     */
    union(other, options){
        const values = new Set([...other].concat(this._values))
        const index  = new Index(Array.from(values), {name:this.name})
        
        if(!options || options.sort === undefined){
            if(this.length == index.length) return this
            return index.sortable ? index.sort() : index
        }
        if(options.sort){
            return index.sort()
        }
        return index
    }

    /**
     * Create a new index from intersection of others
     * @param {*} others 
     */
    static intersection(others, options){
        if(!Array.isArray(others) || !others.every(utils.isIterable)){
            throw new Error("(static) intersection expected a list of iterables")
        }
        const values = others.map(v => new Set(v)).reduce((acc, curr) => {
            return new Set([...acc].filter(v => curr.has(v)))
        })

        const index = new Index(values, options)

        if(!options || options.sort === undefined){
            return index.sortable ? index.sort() : index
        }
        if(options.sort){
            return index.sort()
        }
        return index
    }

    /**
     * Returns a new index combining the intersection of this and another iterble
     * The new index is sorted in ascending order
     * 
     * @param {*} other 
     */
    intersection(other, options){
        const values = [...other].filter(v => this.has(v))
        const index  = new Index(values, {name:this.name})

        if(!options || options.sort === undefined){
            if(index.length == this.length) return this
            return index.sortable ? index.sort() : index
        }
        if(options.sort){
            return index.sort()
        }
        return index
    }

    /**
     * Returns a new index containing elements in self but not in other
     * 
     * @param {*} other Another iterable
     */
    difference(other){
        const intersection = this.intersection(other)
        const index = this.filter(v => !intersection.has(v))

        if(!options || options.sort === undefined){
            return index.sortable ? index.sort() : index
        }
        if(options.sort){
            return index.sort()
        }
        return index
    }

    /**
     * Returns a series with the year
     */
    year(){
        return new Series(this._values.map(v => datetime(v).year()), {index:this, name:this.name})
    }

    /**
     * Returns a series with the year
     */
    quarter(){
        return new Series(this._values.map(v => datetime(v).quarter()), {index:this, name:this.name})
    }

    /**
     * Returns a series with the year
     */
    month(){
        return new Series(this._values.map(v => datetime(v).month()), {index:this, name:this.name})
    }

    /**
     * Returns a series with the year
     */
    weeknum(){
        return new Series(this._values.map(v => datetime(v).isoWeek()), {index:this, name:this.name})
    }

    /**
     * Returns a series with the weekday (1 for Monday, 7 for Sunday)
     */
    weekday(){
        return new Series(this._values.map(v => datetime(v).isoWeekday()), {index:this, name:this.name})
    }

    /**
     * Returns a series with the day of the month
     */
    day(){
        return new Series(this._values.map(v => datetime(v).date()), {index:this, name:this.name})
    }
    
    /**
     * Returns a series with the day of the month
     */
    dayofyear(){
        return new Series(this._values.map(v => datetime(v).dayOfYear()), {index:this, name:this.name})
    }
}