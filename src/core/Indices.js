import Immutable from 'immutable'

class Index{
    constructor(indices, options){
        if(indices instanceof Index){
            this._indices = indices.indices
            this._name    = indices.name
            return
        }
        else if(Immutable.List.isList(indices)){
            this._indices = indices
        }
        else if(Array.isArray(indices)){
            this._indices = Immutable.List(indices)
        }
        else{
            throw new Error("Unable to parse indices")
        }

        if(options && options.name){
            this._name = options.name
        }
        else{
            this._name = undefined
        }
    }
    get indices(){
        return this._indices
    }
    get name(){
        return this._name
    }
    get length(){
        return this._indices.size
    }
    get empty(){
        return this.length == 0
    }
    copy(){
        return new Index(this)
    }
    iloc(index){
        if(index < 0){
            index = this.length + index
        }
        if(index >= this.length){
            throw new Error("Out of range error: index " + i + " is out of bounds")
        }
        return this._indices.get(index)
    }
    loc(label){
        return this._indices.indexOf(label)
    }
    slice(begin, end){
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
        return this._indices.has(label)
    }
    push(label, options){
        if(options && options.inplace){
            this._indices = this._indices.push(label)
            return
        }
        return new Index(this._indices.push(label), {name:this._name})
    }
    pop(options){
        if(options && options.inplace){
            this._indices = this._indices.pop()
            return
        }
        return new Index(this._indices.pop(), {name:this._name})
    }
    rename(name, options){
        if(options && options.inplace){
            this._name = name
            return
        }
        return new Index(this._indices, {name:name})
    }
    sort(func, options){
        if(options && options.inplace){
            this._indices = this._indices.sort(func)
            return
        }
        return new Index(this._indices.sort(func), {name:name})
    }
    reverse(options){
        if(options && options.inplace){
            this._indices = this._indices.reverse()
            return this
        }
        return new Index(this._indices.reverse(), {name:name})
    }
    map(func, options){
        if(options && options.inplace){
            this._indices = this._indices.map(func)
            return
        }
        return new Index(this._indices.map(func), {name:this._name})
    }
    filter(func, options){
        if(options && options.inplace){
            this._indices = this._indices.filter(func)
            return
        }
        return new Index(this._indices.filter(func), {name:this._name})
    }
    max(func){
        if(this.empty){
            throw new Error("Could not compute max on empty index")
        }
        return this._indices.max(func)
    }
    min(func){
        if(this.empty){
            throw new Error("Could not compute min on empty index")
        }
        return this._indices.min(func)
    }
    idxmin(){
        return this._indices.indexOf(this.min())
    }
    idxmax(){
        return this._indices.indexOf(this.max())
    }
    concat(other){
        return new Index(this._indices.concat(other), {name:name})
    }
    union(other){
        if(this.duplicates().any()){
            throw new Error("Set operations like .union are not permitted on indices with duplicates")
        }
        if(other instanceof Index){
            const indices = this._indices.toSet().union(other.indices.toSet()).toList()
            return new Index(indices, {name:this._name})
        }
        else if(Immutable.List.isList(other)){
            const indices = this._indices.toSet().union(other.toSet()).toList()
            return new Index(indices, {name:this._name})
        }
        else if(Array.isArray(other)){
            const indices = this._indices.toSet().union(Immutable.Set(other)).toList()
            return new Index(indices, {name:this._name})
        }
        else{
            throw new Error("TypeError: Unable to perform union on " + other)
        }
    }
    intersection(other){
        if(this.duplicates().any()){
            throw new Error("Set operations like .intersection are not permitted on indices with duplicates")
        }
        if(other instanceof Index){
            const indices = this._indices.toSet().intersect(other.indices.toSet()).toList()
            return new Index(indices, {name:this._name})
        }
        else if(Immutable.List.isList(other)){
            const indices = this._indices.toSet().intersect(other.toSet()).toList()
            return new Index(indices, {name:this._name})
        }
        else if(Array.isArray(other)){
            const indices = this._indices.toSet().intersect(Immutable.Set(other)).toList()
            return new Index(indices, {name:this._name})
        }
        else{
            throw new Error("TypeError: Unable to perform intersection on " + other)
        }
    }
    difference(other){
        if(this.duplicates().any()){
            throw new Error("Set operations like .difference are not permitted on indices with duplicates")
        }
        if(other instanceof Index){
            const indices = this._indices.toSet().subtract(other.indices.toSet()).toList()
            return new Index(indices, {name:this._name})
        }
        else if(Immutable.List.isList(other)){
            const indices = this._indices.toSet().subtract(other.toSet()).toList()
            return new Index(indices, {name:this._name})
        }
        else if(Array.isArray(other)){
            const indices = this._indices.toSet().subtract(Immutable.Set(other)).toList()
            return new Index(indices, {name:this._name})
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
            return this._indices.toJS()
        }
        return this._indices
    }
    mask(other){
        if(other instanceof Index){
            if(other.length != this.length){
                throw new Error("Masking index must be of length " + this.length + ", " + other.length + " given")
            }
            const indices = this._indices.filter((value, i) => {
                return other.iloc(i)
            })
            return new Index(indices, {name:this._name})
        }
        else if(Immutable.List.isList(other)){
            if(other.size != this.length){
                throw new Error("Masking list must be of length " + this.length + ", " + other.size + " given")
            }
            const indices = this._indices.filter((value, i) => {
                return other.get(i)
            })
            return new Index(indices, {name:this._name})
        }
        else if(Array.isArray(other)){
            if(other.length != this.length){
                throw new Error("Masking list must be of length " + this.length + ", " + other.length + " given")
            }
            const indices = this._indices.filter((value, i) => {
                return other[i]
            })
            return new Index(indices, {name:this._name})
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
            const indices = this._indices.map((value, i) => {
                return this._indices.indexOf(value) != i
            })
            return new Index(indices, {name:this._name})
        }
        else if(keep == "last"){
            return this.reverse().duplicates("first").reverse()
        }
        else{
            const reversed = this.reverse(), length = this.length

            const indices = this._indices.map((value, i) => {
                return this._indices.indexOf(value) != i || reversed.indices.indexOf(value) != (length - i - 1)
            })
            return new Index(indices, {name:this._name})
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
            const indices = this._indices.map(value => {
                return String(value)
            })
            return new Index(indices, {name:this.name})
        } 
        else if(dtype == "number"){
            const indices = this._indices.map(value => {
                return Number(value)
            })
            return new Index(indices, {name:this.name})
        }
        else if(dtype == "boolean"){
            const indices = this._indices.map(value => {
                return Boolean(value)
            })
            return new Index(indices, {name:this.name})
        }
        else if(dtype ==  "date"){
            const indices = this._indices.map(value => {
                return new Date(value)
            })
            return new Index(indices, {name:this.name})
        }
        else if(dtype == "object"){
            return new Index(this._indices, {name:this.name})
        }
        else{
            throw new Error("Invalid dtype, " + dtype + " given")
        }
    }
}

export { Index }