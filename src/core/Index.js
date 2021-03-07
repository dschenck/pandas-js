import datetime   from './libs/datetime'
import * as utils from './utils'
import Series     from './Series'

export default class Index{ 
    constructor(values, options){
        if(values instanceof Index){
            if(!options){
                return values
            }
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
     * Returns one of false, 'ascending' or 'descending'
     */
    get sorted(){
        if(this._options.sorted === undefined){
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
        if(!this.unique){
            throw new Error("loc requires index to have unique values only")
        }
        if(utils.isIterable(keys)){
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
     * 
     * Todo: optimise using bisection
     */ 
    asof(value){
        if(!this.sorted){
            throw new Error("asof requires that the index is sorted")
        }
        if(this.keymap.has(value)){
            return value
        }
        if(this.sorted == "ascending"){
            if(this.at(0) < value){
                throw new Error(`value is out of bounds (${value} is lower than the smallest value of the index)`)
            }
            return this._values.reduce((acc, curr) => {
                return curr > value ? acc : curr   
            })
        }
        if(this.at(this.length - 1) < value){
            throw new Error(`value is out of bounds (${value} is lower than the smallest value of the index)`)
        }
        return [...this._values].reverse().reduce((acc, curr) => {
            return curr > value ? acc : curr  
        })
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
        const values = this.values.sort(func || ((a, b) => a < b ? -1 : 1))
        return new Index(values, {...this.options, sorted:"ascending"})
    }

    /**
     * Reverse the index (first to last)
     */
    reverse(){
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
        return this._values.reduce((prev, curr) => prev > curr ? prev : curr, undefined)
    }

    /**
     * Returns the min of the index
     */
    min(){
        if(this.length == 0){
            throw new Error("Cannot compute min of empty index")
        }
        return this._values.reduce((prev, curr) => prev < curr ? prev : curr, undefined)
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
        if(utils.isIterable(labels)){
            return this.filter(v => labels.indexOf(v) != -1)
        }
        throw new Error("Expected labels to be an iterable")
    }

    /**
     * Creates a new index combining the values of this and another iterable
     * The new index is sorted in ascending order
     * 
     * @param {*} other 
     */
    union(other){
        const values = new Set([...other].concat(this._values))
        
        return new Index(
            Array.from(values).sort((a, b) => a < b ? -1 : 1), 
            {sorted:"ascending", name:this.name}
        )
    }

    /**
     * Returns a new index combining the intersection of this and another iterble
     * The new index is sorted in ascending order
     * 
     * @param {*} other 
     */
    intersection(other){
        const values = [...other].filter(v => this.has(v)).sort((a, b) => a < b ? -1 : 1)
        return new Index(values, {sorted:"ascending", name:this.name})
    }

    /**
     * Returns a new index containing elements in self but not in other
     * 
     * @param {*} other Another iterable
     */
    difference(other){
        const intersection = this.intersection(other)
        return this.filter(v => !intersection.has(v), {name:this.name})
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