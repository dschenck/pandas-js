import { Index }     from './Index'
import { Series }    from './Series'
import { DataFrame } from './DataFrame'

class BaseGrouper{
    constructor(options){
        this.options = options
    }
    first(){
        return this.apply(srs => srs[0], {raw:true})
    }
    last(){
        return this.apply(srs => srs[srs.length - 1], {raw:true})
    }
    min(){
        return this.apply(srs => srs.min())
    }
    max(){
        return this.apply(srs => srs.max())
    }
    count(skipnan = true){
        return this.apply(srs => srs.count(skipnan))
    }
    sum(){
        return this.apply(srs => srs.sum())
    }
    mean(){
        return this.apply(srs => srs.mean())
    }
    std(){
        return this.apply(srs => srs.std())
    }
    var(){
        return this.apply(srs => srs.var())
    }
    idxmin(){
        return this.apply(srs => srs.idxmin())
    }
    idxmax(){
        return this.apply(srs => srs.idxmax())
    }
    all(){
        return this.apply(srs => srs.all())
    }
    any(){
        return this.apply(srs => srs.any())
    }
}

export class Grouper extends BaseGrouper{
    constructor(options){
        super(options)
        this.groups = new Map()
    }
    get index(){
        return new Index(this.groups.keys())
    }
    add(group, index, value){
        if(!this.groups.has(group)) this.groups.set(group, [[],[]])
        this.groups.get(group)[0].push(index)
        this.groups.get(group)[1].push(value)
        return
    }
    apply(callback, options){
        const values = [...this.groups.keys()].map(key => {
            if(options && options.raw){
                return callback(this.groups.get(key)[1])
            }
            return callback(new Series(this.groups.get(key)[1], {index:this.groups.get(key)[0], name:key}))
        })
        return new Series(values, {index:this.groups.keys(), name:this.underlying.name})
    }
}

export class Pivot extends BaseGrouper{
    constructor(options){
        super(options)
        this.mapping = new Map()
    }
    add(index, column, key, value){
        if(!this.mapping.has(index)){
            this.mapping.set(index, new Map())
        }
        if(!this.mapping.get(index).has(column)){
            this.mapping.get(index).set(column, {keys:[], values:[]})
        }
        this.mapping.get(index).get(column).keys.push(key)
        this.mapping.get(index).get(column).values.push(value)
    }
    get index(){
        return Array.from(new Set(this.mapping.keys()))
    }
    get columns(){
        const columns = new Set()
        for(let idx of this.mapping.keys()){
            for(let col of this.mapping.get(idx).keys()){
                columns.add(col)
            }
        }
        return Array.from(columns)
    }
    apply(callback, options){
        const values = this.index.map((index, i) => {
            return this.columns.map((column, c) => {
                if(!this.mapping.has(index) || !this.mapping.get(index).has(column)){
                    return NaN
                }
                if(options && options.raw){
                    return callback(this.mapping.get(index).get(column).values)
                }
                return callback(new Series(this.mapping.get(index).get(column).values, 
                    {index:this.mapping.get(index).get(column).index}))
            })
        })
        return new DataFrame(values, {index:this.index, columns:this.columns})
    }
}