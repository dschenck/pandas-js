import Immutable from 'immutable'
import { Index } from './Indices'
import * as exceptions from './Exceptions'

export class Series{
    constructor(data, options){
        if(data instanceof Series){
            this._values = data.values
            this._name   = data.name
            this._index  = data.index
        }
        else if(Immutable.isList(data)){
            this._values = data
        }
        else if(Immutable.isMap(data)){
            this._values = Immutable.List(data.values())
            this._index  = new Index(data.keys())
        }
        else if(Array.isArray(data)){
            this._values = Immutable.List(data)
        }
        else if(data === undefined){
            this._values = Immutable.List()
        }
        else{ 
            throw new TypeError('Could not parse the data')
        }
        if(options && options.name){
            this._name = options.name
        }
        if(options && options.index){
            this._index = new Index(options.index)
            if(this._index.length != this._values.size){
                throw new exceptions.ValueError('Index and data are of different length')
            }
        }
        else{
            this._index = new Index(Immutable.Range(0, this._values.size).toList())
        }
    }
    get values(){
        return this._values
    }
    get index(){
        return this._index
    }
    set index(indices){
        try{
            indices = new Index(indices)
        }
        catch(error){
            throw new Error('Could not convert indices to index')
        }
        if(indices.length != this.length){
            throw new Error('Length mismatch error')
        }
        this._index = indices
    }
    get name(){
        return this._name
    }
    get length(){
        return this._values.size
    }
    loc(...labels){
        if(labels.length === 1){
            return this.values.get(this.index.loc(labels[0]))
        }
        return Immutable.List(labels.map(label => {
            return this.values.get(this.index.loc(label))
        }))
    }
    iloc(index){
        if(index > this.length || (this.length + index) < 0){
            throw new Error('Out of bounds error')
        }
        return this.values.get(index)
    }
    slice(begin, end){
        if(begin > this.length || (this.length + begin) < 0){
            throw new Error('Out of bounds error')
        }
        if(end && (end > this.length || (this.length + end) < 0)){
            throw new Error('Out of bounds error')
        }
        return new Series(this.values.slice(begin, end), {name:this.name, index:this.index.slice(begin, end)})
    }
    sum(){
        return this.values.reduce((prev, curr) => {
            return prev + curr
        }, 0)
    }
    mean(){
        return this.sum() / (this.map((value) => {
            return !isNaN(value)
        }).sum())
    }
    cum(reducer, initializer){
        let values = []
        for(let i = 0, len = this.length; i < len; i++){
            if(i == 0){
                if(initializer){
                    values.push(initializer(this.iloc(0)))
                }
                else {
                    values.push(Number(this.iloc(0)))
                }
            }
            else{
                values.push(reducer(values[i-1], this.values.get(i)))
            }
        }
        return new Series(values, {index:this.index, name:this.name})
    }
    cumsum(){
        return this.cum((prev, curr) => {
            return prev + curr
        })
    }
    cumprod(){
        return this.cum((prev, curr) => {
            return prev * curr
        })
    }
    cummax(){
        return this.cum((prev, curr) => {
            return prev > curr ? prev : curr
        })
    }
    cummin(){
        return this.cum((prev, curr) => {
            return prev > curr ? curr : prev
        })
    }
    compound(){
        return this.cum((prev, curr) => {
            return (1 + curr) * (1 + prev) - 1
        })
    }
    abs(){
        return this.map((value, i) => {
            return Math.abs(value)
        })
    }
    neg(){
        return this.map((value, i) => {
            return -value
        })
    }
    inc(increment = 0){
        return this.map((value, i) => {
            return value + increment
        })
    }
    dec(decrement = 0){
        return this.map((value, i) => {
            return value - decrement
        })
    }
    add(other, options){
        if(other instanceof Series){
            if(options && options["ignore index"]){
                if(other.length != this.length){
                    throw new Error('Mask series must be of equal length')
                }
                return this.map((value, i) => {
                    return other.iloc(i) + value
                })
            } 
            else {
                return this.map((value, i) => {
                    return value + other.loc(this.index.iloc(i))
                })
            }
        }
        else if(Immutable.isList(other)){
            if(other.size != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.map((value, i) => {
                return other.get(i) + value
            })
        }
        else if(Array.isArray(other)){
            if(other.length != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.map((value, i) => {
                return other[i] + value
            })
        }
        return this.map((value) => value + other)
    }
    multiply(other){
        if(other instanceof Series){
            if(options && options["ignore index"]){
                if(other.length != this.length){
                    throw new Error('Mask series must be of equal length')
                }
                return this.map((value, i) => {
                    return other.iloc(i) * value
                })
            } 
            else {
                return this.map((value, i) => {
                    return value * other.loc(this.index.iloc(i))
                })
            }
        }
        else if(Immutable.isList(other)){
            if(other.size != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.map((value, i) => {
                return other.get(i) * value
            })
        }
        else if(Array.isArray(other)){
            if(other.length != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.map((value, i) => {
                return other[i] * value
            })
        }
        return this.map((value) => value * other)
    }
    subtract(other){
        if(other instanceof Series){
            if(options && options["ignore index"]){
                if(other.length != this.length){
                    throw new Error('Mask series must be of equal length')
                }
                return this.map((value, i) => {
                    return other.iloc(i) - value
                })
            }
            else {
                return this.map((value, i) => {
                    return value - other.loc(this.index.iloc(i))
                })
            }
        }
        else if(Immutable.isList(other)){
            if(other.size != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.map((value, i) => {
                return other.get(i) - value
            })
        }
        else if(Array.isArray(other)){
            if(other.length != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.map((value, i) => {
                return other[i] - value
            })
        }
        return this.map((value) => value - other)
    }
    divide(other){
        if(other instanceof Series){
            if(options && options["ignore index"]){
                if(other.length != this.length){
                    throw new Error('Mask series must be of equal length')
                }
                return this.map((value, i) => {
                    return other.iloc(i) / value
                })
            } 
            else {
                return this.map((value, i) => {
                    return value / other.loc(this.index.iloc(i))
                })
            }
        }
        else if(Immutable.isList(other)){
            if(other.size != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.map((value, i) => {
                return other.get(i) / value
            })
        }
        else if(Array.isArray(other)){
            if(other.length != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.map((value, i) => {
                return other[i] / value
            })
        }
        return this.map((value) => value / other)
    }
    mod(other){
        if(other instanceof Series){
            if(options && options["ignore index"]){
                if(other.length != this.length){
                    throw new Error('Mask series must be of equal length')
                }
                return this.map((value, i) => {
                    return other.iloc(i) % value
                })
            }
            else {
                return this.map((value, i) => {
                    return value % other.loc(this.index.iloc(i))
                })
            }
        }
        else if(Immutable.isList(other)){
            if(other.size != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.map((value, i) => {
                return other.get(i) % value
            })
        }
        else if(Array.isArray(other)){
            if(other.length != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.map((value, i) => {
                return other[i] % value
            })
        }
        return this.map((value) => value % other)
    }
    equals(other){
        if(other instanceof Series){
            if(options && options["ignore index"]){
                if(other.length != this.length){
                    throw new Error('Mask series must be of equal length')
                }
                return this.filter((value, i) => {
                    return other.iloc(i) == value
                })
            } 
            else{
                return this.filter((value, i) => {
                    return other.loc(this.index.iloc(i)) == value
                })
            }
        }
        else if(Immutable.isList(other)){
            if(other.size != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.filter((value, i) => {
                return other.get(i) == value
            })
        }
        else if(Array.isArray(other)){
            if(other.length != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.filter((value, i) => {
                return other[i] == value
            })
        }
        return this.map((value) => value == other)
    }
    ne(other){
        return this.equals(other).not()
    }
    gt(other){
        if(other instanceof Series){
            if(options && options["ignore index"]){
                if(other.length != this.length){
                    throw new Error('Mask series must be of equal length')
                }
                return this.filter((value, i) => {
                    return other.iloc(i) > value
                })
            } 
            else{
                return this.filter((value, i) => {
                    return other.loc(this.index.iloc(i)) > value
                })
            }
        }
        else if(Immutable.isList(other)){
            if(other.size != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.filter((value, i) => {
                return other.get(i) > value
            })
        }
        else if(Array.isArray(other)){
            if(other.length != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.filter((value, i) => {
                return other[i] > value
            })
        }
        return this.map((value) => value > other)
    }
    gte(other){
        if(other instanceof Series){
            if(options && options["ignore index"]){
                if(other.length != this.length){
                    throw new Error('Mask series must be of equal length')
                }
                return this.filter((value, i) => {
                    return other.iloc(i) >= value
                })
            } 
            else{
                return this.filter((value, i) => {
                    return other.loc(this.index.iloc(i)) >= value
                })
            }
        }
        else if(Immutable.isList(other)){
            if(other.size != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.filter((value, i) => {
                return other.get(i) >= value
            })
        }
        else if(Array.isArray(other)){
            if(other.length != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.filter((value, i) => {
                return other[i] >= value
            })
        }
        return this.map((value) => value >= other)
    }
    lt(other){
        if(other instanceof Series){
            if(options && options["ignore index"]){
                if(other.length != this.length){
                    throw new Error('Mask series must be of equal length')
                }
                return this.filter((value, i) => {
                    return other.iloc(i) < value
                })
            } 
            else{
                return this.filter((value, i) => {
                    return other.loc(this.index.iloc(i)) < value
                })
            }
        }
        else if(Immutable.isList(other)){
            if(other.size != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.filter((value, i) => {
                return other.get(i) < value
            })
        }
        else if(Array.isArray(other)){
            if(other.length != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.filter((value, i) => {
                return other[i] < value
            })
        }
        return this.map((value) => value < other)
    }
    lte(other){
        if(other instanceof Series){
            if(options && options["ignore index"]){
                if(other.length != this.length){
                    throw new Error('Mask series must be of equal length')
                }
                return this.filter((value, i) => {
                    return other.iloc(i) <= value
                })
            } 
            else{
                return this.filter((value, i) => {
                    return other.loc(this.index.iloc(i)) <= value
                })
            }
        }
        else if(Immutable.isList(other)){
            if(other.size != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.filter((value, i) => {
                return other.get(i) <= value
            })
        }
        else if(Array.isArray(other)){
            if(other.length != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.filter((value, i) => {
                return other[i] <= value
            })
        }
        return this.map((value) => value <= other)
    }
    max(){
        return this.values.reduce((prev, curr) => {
            return prev > curr ? prev : curr
        })
    }
    min(){
        return this.values.reduce((prev, curr) => {
            return prev > curr ? curr : prev
        })
    }
    rename(name, options){
        return new Series(this.values, {name:name, index:this.index})
    }
    reverse(options){
        return new Series(this.values.reverse(), {name:this.name, index:this.index.reverse()})
    }
    map(func, options){
        return new Series(this.values.map(func), {name:this.name, index:this.index})
    }
    filter(func, options){
        const values = this.values.filter(func)
        const index  = this.index.filter((value, i) => {
            return func(this.values.get(i), i)
        }) 
        return new Series(values, {name:this.name, index:index})
    }
    mask(other){
        if(other instanceof Series){
            if(other.length != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.filter((value, i) => {
                return other.iloc(i) == true
            })
        }
        else if(Immutable.isList(other)){
            if(other.size != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.filter((value, i) => {
                return other.get(i) == true
            })
        }
        else if(Array.isArray(other)){
            if(other.length != this.length){
                throw new Error('Mask series must be of equal length')
            }
            return this.filter((value, i) => {
                return other[i] == true
            })
        }
        throw new Error('Invalid mask type')
    }
    isNaN(){
        return this.map((value) => {
            return isNaN(value)
        })
    }
    isNA(){
        return this.map((value) => {
            return value === undefined || value !== value
        })
    }
    dropna(){
        return this.mask(this.isNA().not())
    }
    fillna(options){
        if(options && options.method){
            if(options.method == "ffill"){
                return this.cum((prev, curr) => {
                    if(curr === undefined || curr !== curr){
                        return prev
                    }
                    return curr
                }, (value) => value === undefined ? NaN : value)
            }
            else if(options.method == "bfill"){
                return this.reverse().fillna({method:"ffill"}).reverse()
            }
        }
        else if(options && options.value){
            return this.cum((prev, curr) => {
                if(curr === undefined || curr !== curr){
                    return options.value
                }
                return curr
            }, (value) => (value === undefined || value !== value) ? options.value : value)
        }
        throw new Error('You must pass a method or a fill value')
    }
    asof(label, options){
        const loc = this.index.asof(label, options)
        return this.values.get(this.index.loc(loc))
    }
    all(strict){
        for(let i = 0, len = this.length; i < len; i++){
            if(strict && this.iloc(i) !== true){
                return false
            }
            else if(this.iloc(i) == false){
                return false
            }
        }
        return true
    }
    any(strict){
        for(let i = 0, len = this.length; i < len; i++){
            if(strict && this.iloc(i) === true){
                return true
            }
            else if(this.iloc(i) == true){
                return true
            }
        }
        return false
    }
    not(){
        return this.map((value) => !value)
    }
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
        else if(dtype ==  "date"){
            return this.map((value) => new Date(value))
        }
        else if(dtype == "object"){
            return this.map(value => value)
        }
        else{
            throw new Error("Invalid dtype, " + dtype + " given")
        }
    }
    diff(periods = 1){
        if(periods > 0){
            return this.map((value, i) => {
                if(i < periods){
                    return NaN
                }
                return this.values.get(i) - this.values.get(i - periods)
            })
        }
        throw new Error('Series.diff offset must be positive')
    }
    toList(index = false, native = false){
        if(!index){
            if(native){
                return this.values.toJS()
            }
            return this.values
        }
        if(native){
            return this.map((value, i) => {
                return [this.index.iloc(i), value]
            }).toJS()
        }
        return this.map((value, i) => {
            return [this.index.iloc(i), value]
        })
    }
    every(period = 1){
        return this.filter((value, i) => {
            return i % period == 0
        })
    }
    head(count){
        return this.slice(0, count)
    }
    tail(count){
        return this.slice(-count)
    }
    copy(){
        return new Series(this.values, {name:this.name, index:this.index})
    }
    drop(labels, axis = "index"){
        if(axis == "index"){
            return this.filter((value, i) => {
                return labels.indexOf(this.index.iloc(i)) != -1
            })
        }
        return this.filter((value, i) => {
            return labels.indexOf(value) != -1
        })
    }
    idxmax(){
        const max = this.max()
        for(let i = 0, len = this.length; i < len; i++){
            if(this.iloc(i) == max){
                return this.index.iloc(i)
            }
        }
    }
    idxmin(){
        const min = this.min()
        for(let i = 0, len = this.length; i < len; i++){
            if(this.iloc(i) == min){
                return this.index.iloc(i)
            }
        }
    }
    isin(values){
        return this.map((value, i) => {
            return values.indexOf(value) != -1
        })
    }
    str(){
        return this.astype("string")
    }
    where(func, other){
        return this.map((value, i) => {
            if(func(value, i)){
                return value
            }
            else{
                if(other instanceof Series){
                    return other.loc(this.index.iloc(i))
                }
                else if(Immutable.isList(other)){
                    return other.get(i)
                }
                else if(Array.isArray(other)){
                    return other[i]
                }
                else{
                    return other
                } 
            }
        })
    }
    toFixed(n = 0){
        return this.astype("number").map((value, i) => {
            return value.toFixed(n)
        })
    }
    reindex(index, options){
        const values = index.map((idx, i) => {
            if(this.index.has(idx)){
                return this.loc(idx)
            }
            else{
                if(options && options.fill){
                    return options.fill
                }
                return Math.NaN
            }
        })
        return new Series(values, {name:this.name, index:index})
    }
    uniques(){
        return this.values.toSet().toList()
    }
}