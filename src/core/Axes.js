import * as utils from './utils'

class Axis{
    constructor(values, options){
        if(values === undefined){
            this.values = []
        }
        else if(values instanceof Axis){
            this.values = values.values
            this.name   = values.name
        }
        else if(Array.isArray(values)){
            this.values = values
        }
        else{
            throw new Error("Unable to parse values")
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
    /**
     * Returns a new axis
     */
    copy(){
        return new Axis(this)
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
     * @param {*} keys 
     */
    loc(keys){
        if(utils.ismappable(keys)){
            return new Axis(keys.map(key => this.indexOf(key)), {name:this.name})
        }
        return this.indexOf(keys)
    }
    at(index){
        if(index >= this.length || (this.length + index) < 0){
            throw new Error('Out of bounds error')
        }
        return index < 0 ? this._values[this.length + index] : this._values[index] 
    }
    iloc(indices){
        if(utils.ismappable(indices)){
            return new Axis(indices.map(i => this.at(i)), {name:this.name})
        }
        return this.at(indices)
    }
    slice(begin, end){
        if(begin > this.length || (this.length + begin) < 0){
            throw new Error('Out of bounds error')
        }
        if(end && (end > this.length || (this.length + end) < 0)){
            throw new Error('Out of bounds error')
        }
        return new Axis(this._values.slice(begin, end), {name:this.name})
    }
    push(label, options){
        if(options && options.inplace){
            this.values = this._values.push(label)
            return
        }
        return new Axis(this._values.push(label), {name:this.name})
    }
    pop(options){
        if(options && options.inplace){
            this.values = this._values.pop()
            return
        }
        return new Axis(this._values.pop(), {name:this.name})
    }
    rename(name, options){
        if(options && options.inplace){
            this._name = name
            return
        }
        return new Axis(this._values, {name:this.name})
    }
    sort(func, options){
        if(options && options.inplace){
            this.values = this._values.sort(func)
            return
        }
        return new Axis([...this._values].sort(func), {name:this.name})
    }
    reverse(options){
        if(options && options.inplace){
            this.values = this._values.reverse()
            return this
        }
        return new Axis([...this._values].reverse(), {name:this.name})
    }
    map(func, options){
        if(options && options.inplace){
            this.values = this._values.map(func)
            return
        }
        return new Axis(this._values.map(func), {name:this._name})
    }
    filter(func, options){
        if(options && options.inplace){
            this.values = this._values.filter(func)
            return
        }
        return new Axis(this._values.filter(func), {name:this._name})
    }
    max(){
        if(this.length == 0){
            throw new Error("Could not compute max on empty index")
        }
        return this._values.reduce((prev, curr) => prev > curr ? prev : curr, undefined)
    }
    min(){
        if(this.length == 0){
            throw new Error("Could not compute min on empty index")
        }
        return this._values.reduce((prev, curr) => prev < curr ? prev : curr, undefined)
    }
    idxmin(){
        return this.indexOf(this.min())
    }
    idxmax(){
        return this.indexOf(this.max())
    }
    concat(other){
        if(other instanceof Axis){
            return new Axis(this._values.concat(other._values), {name:this.name})
        }
        return new Axis(this._values.concat(other), {name:name})
    }
    mask(mask){
        if(mask.length != this.length){
            throw new Error("Mask should be of the same length as the axis")
        }
        return new Axis(mask.map((value, i) => value ? i : -1).filter(value => value !== -1).map(i => this._values[i]), {name:this.name})
    }
}

export { Axis }