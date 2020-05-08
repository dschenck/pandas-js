import * as utils from './utils'

class Index{
    constructor(values, options){
        if(values === undefined){
            this.values = []
        }
        else if(values instanceof Index){
            this.values = values.values
            this.name   = values.name
        }
        else {
            this.values = values
        }
        if(options && options.name){
            this.name = options.name
        }
    }
    get values(){
        return [...this._values]
    }
    set values(values){
        this._values = [...values]
        this._keymap = new Map(this._values.map((key, pos) => [key, pos]))
        if(this._values.length != this._keymap.size){
            throw new Error("Index cannot have duplicate values")
        }
    }
    get name(){
        return this._name
    }
    set name(name){
        this._name = name
    }
    get length(){
        return this._values.length
    }
    get keymap(){
        return this._keymap
    }
    get series(){
        return new Series(this._values, {index:this, name:this.name})
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
     * Returns a new axis
     */
    copy(){
        return new Index(this)
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
        if(this.has(key)){
            return this.keymap.get(key)
        }
        throw new Error(`KeyError: key ${key} not in axis`)
    }
    /**
     * Returns a new axis with the position of the passed keys
     * If the keys is a mappable object, then it returns a new 
     * axis with the position of each of the passed key
     * @param {*} keys 
     */
    loc(keys){
        if(utils.ismappable(keys)){
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
            throw new Error('Index should be an integer')
        }
        if(index >= this.length || (this.length + index) < 0){
            throw new Error('Out of bounds error')
        }
        return index < 0 ? this._values[this.length + index] : this._values[index] 
    }
    /**
     * Returns the label at the index
     * If given an iterable, then 
     * @param {*} indices 
     */
    iloc(indices){
        if(utils.ismappable(indices)){
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
     * Add a key to the index
     * 
     * @param {*} label 
     * @param {*} options 
     */
    push(label, options){
        if(options && options.inplace){
            this.values = this._values.push(label)
            return
        }
        return new Index([...this._values].push(label), {name:this.name})
    }
    /**
     * Pops the last value from the indices
     * 
     * @param {*} options 
     */
    pop(options){
        if(options && options.inplace){
            this.values = this._values.pop()
            return
        }
        return new Index(this._values.pop(), {name:this.name})
    }
    /**
     * Renames the index 
     * 
     * @param {*} name 
     * @param {*} options 
     */
    rename(name, options){
        if(options && options.inplace){
            this._name = name
            return
        }
        return new Index(this._values, {name:this.name})
    }
    /**
     * Sort the index 
     * 
     * @param {*} func 
     * @param {*} options 
     */
    sort(func, options){
        if(options && options.inplace){
            this.values = this._values.sort(func)
            return
        }
        return new Index([...this._values].sort(func), {name:this.name})
    }
    /**
     * Reverse the index (first to last)
     * 
     * @param {*} options 
     */
    reverse(options){
        if(options && options.inplace){
            this.values = this._values.reverse()
            return this
        }
        return new Index([...this._values].reverse(), {name:this.name})
    }
    /**
     * Returns a new series mapping this index to a new series
     * 
     * @param {*} func 
     * @param {*} options 
     */
    map(func, options){
        if(options && options.inplace){
            this.values = this._values.map(func)
            return
        }
        return new Index(this._values.map(func), {name:this._name})
    }

    /**
     * Filters the index by a callback
     */
    filter(func, options){
        if(options && options.inplace){
            this.values = this._values.filter(func)
            return
        }
        return new Index(this._values.filter(func), {name:this._name})
    }

    /**
     * Returns the max of the index
     */
    max(){
        if(this.length == 0){
            throw new Error("Could not compute max on empty index")
        }
        return this._values.reduce((prev, curr) => prev > curr ? prev : curr, undefined)
    }

    /**
     * Returns the min of the index
     */
    min(){
        if(this.length == 0){
            throw new Error("Could not compute min on empty index")
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
        return new Index([...mask].map((value, i) => value ? i : -1).filter(value => value !== -1).map(i => this._values[i]), {name:this.name})
    }

    /**
     * Creates a new index combining the values of this and another iterable
     * 
     * @param {*} other 
     */
    union(other){
        return new Index(Array.from(new Set(this._values.concat([...other]))))
    }

    /**
     * Returns a new index combining the intersection of this and another iterble
     * @param {*} other 
     */
    intersection(other){
        const [ idx1, idx2 ] = [ new Set(this._values), new Set(other) ]
        const intersection = new Set()
        for(let idx of idx1){
            if(idx2.has(idx)) intersection.add(idx)
        }
        return new Index(Array.from(intersection))
    }
}

export { Index }