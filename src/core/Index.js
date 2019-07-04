import Immutable from 'immutable'

class Index{
    constructor(indices, options){
        if(indices instanceof Index){
            this.indices = indices.indices
            this.name    = indices.name
            this.dtype   = indices.dtype  
        }
        else if(Immutable.List.isList(indices)){
            this.indices = indices
        }
        else if(Array.isArray(indices)){
            this.indices = Immutable.List(indices)
        }
        else{
            throw new Error("Unable to parse indices")
        }

        if(options && options.name){
            this.name = options.name
        }
        else{
            this.name = undefined
        }
        if(options && options.dtype){
            this.dtype = options.dtype
        }
        else{
            if(this.dtype == undefined){
                this.dtype = "object"
            }
        }
    }
    copy(){
        return new Index(this)
    }
    get length(){
        return this.indices.size
    }
    get empty(){
        return this.length == 0
    }
    get deduplicated(){
        return this.length == this.indices.toSet().size
    }
    iloc(index){
        if(index < 0){
            index = this.length + index
        }
        if(index >= this.length){
            throw new Error("Out of range error: index " + i + " is out of bounds")
        }
        return this.indices.get(index)
    }
    slice(bounds){
        if(bounds.begin){
            if(bounds.begin < 0){
                bounds.begin = this.length + bounds.begin
            }
        }
        else{
            bounds.begin = 0
        }
        if(bounds.end){
            if(bounds.end < 0){
                bounds.end = this.length + bounds.end
            }
        }
        else{
            bounds.end = this.length
        }
        return this.filter((value, i) => {
            return i >= bounds.begin && i < bounds.end
        })
    }
    has(label){
        return this.indices.has(label)
    }
    push(label, options){
        if(options && options.inplace){
            this.indices = this.indices.push(label)
            return
        }
        return new Index(this.indices.push(label), {name:this.name, dtype:this.dtype})
    }
    pop(options){
        if(options && options.inplace){
            this.indices = this.indices.pop()
            return
        }
        return new Index(this.indices.pop(), {name:this.name, dtype:this.dtype})
    }
    rename(name, options){
        if(options && options.inplace){
            this.name = name
            return
        }
        return new Index(this.indices, {name:name, dtype:this.dtype})
    }
    sort(func, options){
        if(options && options.inplace){
            this.indices = this.indices.sort(func)
            return
        }
        return new Index(this.indices.sort(func), {name:name, dtype:this.dtype})
    }
    reverse(options){
        if(options && options.inplace){
            this.indices = this.indices.reverse()
            return this
        }
        return new Index(this.indices.reverse(), {name:name, dtype:this.dtype})
    }
    map(func, options){
        if(options && options.inplace){
            this.indices = this.indices.map(func)
            return
        }
        return new Index(this.indices.map(func), {name:this.name})
    }
    filter(func, options){
        if(options && options.inplace){
            this.indices = this.indices.filter(func)
            return
        }
        return new Index(this.indices.filter(func), {name:this.name, dtype:this.dtype})
    }
    max(func){
        if(this.empty){
            throw new Error("Could not compute max on empty index")
        }
        return this.indices.max(func)
    }
    min(func){
        if(this.empty){
            throw new Error("Could not compute min on empty index")
        }
        return this.indices.min(func)
    }
    idxmin(){
        return this.indices.indexOf(this.min())
    }
    idxmax(){
        return this.indices.indexOf(this.max())
    }
    concat(other){
        return new Index(this.indices.concat(other), {name:name})
    }
    union(other){
        if(!this.deduplicated){
            throw new Error("Set operations like .union are not permitted on indices with duplicates")
        }
        if(other instanceof Index){
            const indices = this.indices.toSet().union(other.indices.toSet()).toList()
            return new Index(indices, {name:this.name})
        }
        else if(Immutable.List.isList(other)){
            const indices = this.indices.toSet().union(other.toSet()).toList()
            return new Index(indices, {name:this.name})
        }
        else if(Array.isArray(other)){
            const indices = this.indices.toSet().union(Immutable.Set(other)).toList()
            return new Index(indices, {name:this.name})
        }
        else{
            throw new Error("TypeError: Unable to perform union on " + other)
        }
    }
    intersection(other){
        if(!this.deduplicated){
            throw new Error("Set operations like .intersection are not permitted on indices with duplicates")
        }
        if(other instanceof Index){
            const indices = this.indices.toSet().intersect(other.indices.toSet()).toList()
            return new Index(indices, {name:this.name})
        }
        else if(Immutable.List.isList(other)){
            const indices = this.indices.toSet().intersect(other.toSet()).toList()
            return new Index(indices, {name:this.name})
        }
        else if(Array.isArray(other)){
            const indices = this.indices.toSet().intersect(Immutable.Set(other)).toList()
            return new Index(indices, {name:this.name})
        }
        else{
            throw new Error("TypeError: Unable to perform intersection on " + other)
        }
    }
    difference(other){
        if(!this.deduplicated){
            throw new Error("Set operations like .difference are not permitted on indices with duplicates")
        }
        if(other instanceof Index){
            const indices = this.indices.toSet().subtract(other.indices.toSet()).toList()
            return new Index(indices, {name:this.name})
        }
        else if(Immutable.List.isList(other)){
            const indices = this.indices.toSet().subtract(other.toSet()).toList()
            return new Index(indices, {name:this.name})
        }
        else if(Array.isArray(other)){
            const indices = this.indices.toSet().subtract(Immutable.Set(other)).toList()
            return new Index(indices, {name:this.name})
        }
        else{
            throw new Error("TypeError: Unable to perform intersection on " + other)
        }
    }
    isNaN(nullable){
        return this.map((value) => {
            if(nullable){
                return this.isNaN(value) && value != null
            }
            return this.isNaN(value)
        })
    }
    dropNaN(nullable){
        return this.mask(this.isNaN(nullable))
    }
    toList(native){
        if(native){
            return this.indices.toJS()
        }
        return this.indices
    }
    mask(other){
        if(other instanceof Index){
            if(other.length != this.length){
                throw new Error("Masking index must be of length " + this.length + ", " + other.length + " given")
            }
            const indices = this.indices.filter((value, i) => {
                return other.iloc(i)
            })
            return new Index(indices, {name:this.name, dtype:this.dtype})
        }
        else if(Immutable.List.isList(other)){
            if(other.size != this.length){
                throw new Error("Masking list must be of length " + this.length + ", " + other.size + " given")
            }
            const indices = this.indices.filter((value, i) => {
                return other.get(i)
            })
            return new Index(indices, {name:this.name, dtype:this.dtype})
        }
        else if(Array.isArray(other)){
            if(other.length != this.length){
                throw new Error("Masking list must be of length " + this.length + ", " + other.length + " given")
            }
            const indices = this.indices.filter((value, i) => {
                return other[i]
            })
            return new Index(indices, {name:this.name, dtype:this.dtype})
        }
        else{
            throw new Error("Mask must be an Array/Immutable.List/pd.Index")
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
            const indices = this.indices.toJS().map((value, i) => {
                return this.indices.indexOf(value) == i
            })
            return new Index(indices, {name:this.name, dtype:this.dtype})
        }
        else if(keep == "last"){
            return this.reverse().duplicates("first").reverse()
        }
        else{
            const counts = this.indices.reduce((counter, curr) => {
                if(typeof counter[curr] == 'undefined'){
                    counter[curr] = 1
                }
                else{
                    counter[curr] += 1
                }
                return counter
            }, {})
            
            return this.map((value, i) => {
                return counts[value] == 1
            })
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
            const indices = this.indices.map(value => {
                return String(value)
            })
            return new Index(indices, {name:this.name, dtype:"string"})
        } 
        else if(dtype == "number"){
            const indices = this.indices.map(value => {
                return Number(value)
            })
            return new Index(indices, {name:this.name, dtype:"number"})
        }
        else if(dtype == "boolean"){
            const indices = this.indices.map(value => {
                return Boolean(value)
            })
            return new Index(indices, {name:this.name, dtype:"boolean"})
        }
        else if(dtype ==  "date"){
            const indices = this.indices.map(value => {
                return new Date(value)
            })
            return new Index(indices, {name:this.name, dtype:"date"})
        }
        else if(dtype == "object"){
            return new Index(this.indices, {name:this.name, dtype:"object"})
        }
        else{
            throw new Error("Invalid dtype, " + dtype + " given")
        }
    }
}

export default Index