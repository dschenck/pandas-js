import Immutable from 'immutable'
import * as exceptions from './Exceptions'

class Axis{
    constructor(values, options){
        if(values === undefined){
            this._values = Immutable.List()
        }
        else if(values instanceof Axis){
            this._values  = values.values
            this._name    = values.name
        }
        else if(Immutable.List.isList(values)){
            this._values = values
        }
        else if(Array.isArray(values)){
            this._values = Immutable.List(values)
        }
        else if(values === undefined){
            this._values = Immutable.List()
        }
        else{
            throw new Error("Unable to parse values")
        }

        if(options && options.name){
            this._name = options.name
        }
        else{
            this._name = undefined
        }
    }
    get values(){
        return this._values
    }
    get name(){
        return this._name
    }
    get length(){
        return this._values.size
    }
    get empty(){
        return this.length == 0
    }
    get imap(){
        if(this._map == undefined){
            this._map = Immutable.Map(this._values.map((value, i) => {
                return [value, i]
            }))
        }
        return this._map
    }
    copy(){
        return new Axis(this)
    }
    has(label){
        return this.imap.has(label)
    }
    iloc(index){
        if(index >= this.length || (this.length + index) < 0){
            throw new Error('Out of bounds error')
        }
        return this._values.get(index)
    }
    loc(label){
        if(!this.has(label)){
            throw new Error('The index does not have ' + label)
        }
        return this.imap.get(label)
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
            this._values = this._values.push(label)
            return
        }
        return new Axis(this._values.push(label), {name:this._name})
    }
    pop(options){
        if(options && options.inplace){
            this._values = this._values.pop()
            return
        }
        return new Axis(this._values.pop(), {name:this._name})
    }
    rename(name, options){
        if(options && options.inplace){
            this._name = name
            return
        }
        return new Axis(this._values, {name:name})
    }
    sort(func, options){
        if(options && options.inplace){
            this._values = this._values.sort(func)
            return
        }
        return new Axis(this._values.sort(func), {name:name})
    }
    reverse(options){
        if(options && options.inplace){
            this._values = this._values.reverse()
            return this
        }
        return new Axis(this._values.reverse(), {name:name})
    }
    map(func, options){
        if(options && options.inplace){
            this._values = this._values.map(func)
            return
        }
        return new Axis(this._values.map(func), {name:this._name})
    }
    filter(func, options){
        if(options && options.inplace){
            this._values = this._values.filter(func)
            return
        }
        return new Axis(this._values.filter(func), {name:this._name})
    }
    max(func){
        if(this.empty){
            throw new Error("Could not compute max on empty index")
        }
        return this._values.max(func)
    }
    min(func){
        if(this.empty){
            throw new Error("Could not compute min on empty index")
        }
        return this._values.min(func)
    }
    idxmin(){
        return this._values.indexOf(this.min())
    }
    idxmax(){
        return this._values.indexOf(this.max())
    }
    concat(other){
        return new Axis(this._values.concat(other), {name:name})
    }
    union(other){
        if(this.duplicates().any()){
            throw new Error("Set operations like .union are not permitted on values with duplicates")
        }
        if(other instanceof Axis){
            const values = this._values.toSet().union(other._values.toSet()).toList()
            return new Axis(values, {name:this._name})
        }
        else if(Immutable.List.isList(other)){
            const values = this._values.toSet().union(other.toSet()).toList()
            return new Axis(values, {name:this._name})
        }
        else if(Array.isArray(other)){
            const values = this._values.toSet().union(Immutable.Set(other)).toList()
            return new Axis(values, {name:this._name})
        }
        else{
            throw new Error("TypeError: Unable to perform union on " + other)
        }
    }
    intersection(other){
        if(this.duplicates().any()){
            throw new Error("Set operations like .intersection are not permitted on values with duplicates")
        }
        if(other instanceof Axis){
            const values = this._values.toSet().intersect(other._values.toSet()).toList()
            return new Axis(values, {name:this._name})
        }
        else if(Immutable.List.isList(other)){
            const values = this._values.toSet().intersect(other.toSet()).toList()
            return new Axis(values, {name:this._name})
        }
        else if(Array.isArray(other)){
            const values = this._values.toSet().intersect(Immutable.Set(other)).toList()
            return new Axis(values, {name:this._name})
        }
        else{
            throw new Error("TypeError: Unable to perform intersection on " + other)
        }
    }
    difference(other){
        if(this.duplicates().any()){
            throw new Error("Set operations like .difference are not permitted on values with duplicates")
        }
        if(other instanceof Axis){
            const values = this._values.toSet().subtract(other._values.toSet()).toList()
            return new Axis(values, {name:this._name})
        }
        else if(Immutable.List.isList(other)){
            const values = this._values.toSet().subtract(other.toSet()).toList()
            return new Axis(values, {name:this._name})
        }
        else if(Array.isArray(other)){
            const values = this._values.toSet().subtract(Immutable.Set(other)).toList()
            return new Axis(values, {name:this._name})
        }
        else{
            throw new Error("TypeError: Unable to perform intersection on " + other)
        }
    }
    isNaN(nullable=true){
        return this.map((value) => {
            if(nullable){
                return this.isNaN(Number(value))
            }
            return this.isNaN(Number(value)) || value != value // NaN != NaN > True
        })
    }
    dropNaN(nullable=true){
        return this.mask(this.isNaN(nullable))
    }
    toList(native){
        if(native){
            return this._values.toJS()
        }
        return this._values
    }
    mask(other){
        if(other instanceof Axis){
            if(other.length != this.length){
                throw new Error("Masking index must be of length " + this.length + ", " + other.length + " given")
            }
            const values = this._values.filter((value, i) => {
                return other.iloc(i)
            })
            return new Axis(values, {name:this._name})
        }
        else if(Immutable.List.isList(other)){
            if(other.size != this.length){
                throw new Error("Masking list must be of length " + this.length + ", " + other.size + " given")
            }
            const values = this._values.filter((value, i) => {
                return other.get(i)
            })
            return new Axis(values, {name:this._name})
        }
        else if(Array.isArray(other)){
            if(other.length != this.length){
                throw new Error("Masking list must be of length " + this.length + ", " + other.length + " given")
            }
            const values = this._values.filter((value, i) => {
                return other[i]
            })
            return new Axis(values, {name:this._name})
        }
        else{
            throw new Error("Mask must be an Array/Immutable.List/pd.Axis")
        }
    }
    asof(label, options){
        if(this.has(label)){
            return label
        }
        if(this.empty){
            throw new Error("Could not find an asof value in empty index")
        }
        const sorted = this.sort()
        for(let i = 0; i < sorted.length; i++){
            if(sorted.iloc(i) > label){
                if(i == 0){
                    if(options && options.default){
                        return options.default
                    }
                    return undefined
                }
                return sorted.iloc(i-1)
            }
        }
        return sorted.iloc(-1)
    }
    duplicates(keep){
        if(keep == "first"){
            const values = this._values.map((value, i) => {
                return this._values.indexOf(value) != i
            })
            return new Axis(values, {name:this._name})
        }
        else if(keep == "last"){
            return this.reverse().duplicates("first").reverse()
        }
        else{
            const reversed = this.reverse(), length = this.length

            const values = this._values.map((value, i) => {
                return this._values.indexOf(value) != i || reversed._values.indexOf(value) != (length - i - 1)
            })
            return new Axis(values, {name:this._name})
        }
    }
    deduplicate(keep){
        if(keep == "first"){
            return this.mask(this.duplicates("first").not())
        }
        else if(keep == "last"){
            return this.mask(this.duplicates("last").not())
        }
        else if(keep == undefined || keep == false){
            return this.mask(this.duplicates(false).not())
        }
        else{
            throw new Error("Unexpected argument keep in deduplicate, " + keep + " given.")
        }
    }
    all(strict){
        for(let i = 0; i < this.length; i++){
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
        for(let i = 0; i < this.length; i++){
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
            const values = this._values.map(value => {
                return String(value)
            })
            return new Axis(values, {name:this.name})
        } 
        else if(dtype == "number"){
            const values = this._values.map(value => {
                return Number(value)
            })
            return new Axis(values, {name:this.name})
        }
        else if(dtype == "boolean"){
            const values = this._values.map(value => {
                return Boolean(value)
            })
            return new Axis(values, {name:this.name})
        }
        else if(dtype ==  "date"){
            const values = this._values.map(value => {
                return new Date(value)
            })
            return new Axis(values, {name:this.name})
        }
        else if(dtype == "object"){
            return new Axis(this._values, {name:this.name})
        }
        else{
            throw new Error("Invalid dtype, " + dtype + " given")
        }
    }
}

export { Axis }