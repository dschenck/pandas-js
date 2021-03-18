import stats      from '../stats'
import  Index     from './Index'
import  Series    from './Series'
import  DataFrame from './DataFrame'

class BaseGrouper{
    constructor(underlying, options){
        this.underlying = underlying
        this.options = options
    }
    apply(callback, options){
        throw new Error("not implemented")
    }
    first(options){
        return this.apply(srs => stats.first(srs, options), {raw:true})
    }
    last(options){
        return this.apply(srs => stats.last(srs, options), {raw:true})
    }
    idxfirst(options){
        return this.apply(srs => srs.idxfirst(options))
    }
    idxlast(options){
        return this.apply(srs => srs.idxlast(options))
    }
    min(){
        return this.apply(srs => stats.min(srs), {raw:true})
    }
    max(){
        return this.apply(srs => stats.max(srs), {raw:true})
    }
    count(options){
        return this.apply(srs => stats.count(srs, options), {raw:true})
    }
    sum(){
        return this.apply(srs => stats.sum(srs), {raw:true})
    }
    mean(){
        return this.apply(srs => stats.mean(srs), {raw:true})
    }
    std(options){
        return this.apply(srs => stats.std(srs, options), {raw:true})
    }
    var(options){
        return this.apply(srs => stats.variance(srs, options), {raw:true})
    }
    idxmin(){
        return this.apply(srs => srs.idxmin())
    }
    idxmax(){
        return this.apply(srs => srs.idxmax())
    }
    all(){
        return this.apply(srs => stats.all(srs), {raw:true})
    }
    any(){
        return this.apply(srs => stats.all(srs), {raw:true})
    }
}

export class SeriesGroupby extends BaseGrouper{
    get groups(){
        //split the data
        const mapping = this.underlying._values.map((value, i) => {
            return {index:this.underlying.index.at(i), value}
        }).reduce((groups, curr, i) => {
            //compute the key
            const group = this.options.grouper(curr.value, i, curr.index)

            //if group has not been created
            if(!groups.has(group)){
                groups.set(group, {name:group, index:[], values:[]})
            }

            //push the index and value
            groups.get(group).index.push(curr.index)
            groups.get(group).values.push(curr.value)

            return groups
        }, new Map())

        return [...mapping.values()]
    }
    apply(callback, options){
        //apply a callback function to each group
        const groups = this.groups.map((group, i) => {
            if(options && options.raw){
                return {name:group.name, value:callback(group.values, group.index, group.name)}
            }
            return {name:group.name, value:callback(new Series(group.values, {index:group.index, name:group.name}))}
        })

        //combine the results
        const {values, index} = groups.reduce((acc, curr) => {
            acc.index.push(curr.name)
            acc.values.push(curr.value)
            return acc
        }, {index:[], values:[]})

        return new Series(values, {index:index, name:this.underlying.name})
    }
}

export class Pivot extends BaseGrouper{
    get mapping(){
        //split the data
        return this.underlying._values.map((value, i) => {
            return {index:this.underlying.index.at(i), value}
        }).reduce((acc, curr, i) => {
            const { index, column } = this.options.grouper(curr.value, i, curr.index)

            if(!acc.has(index)){
                acc.set(index, new Map())
            }
            if(!acc.get(index).has(column)){
                acc.get(index).set(column, {name:[index, column], values:[], index:[]})
            }
            acc.get(index).get(column).values.push(curr.value)
            acc.get(index).get(column).index.push(curr.index)
            return acc
        }, new Map()) 
    }
    get groups(){
        const mapping = this.mapping

        return [...mapping.values()].reduce((acc, curr) => {
            return acc.concat([...curr.values()])
        }, [])
    }
    apply(callback, options){
        //split the data
        const mapping = this.mapping
        
        //create the indices
        let index   = new Index(mapping.keys())
        let columns = new Index(index.values.reduce((acc, curr) => {
            return new Set([...acc, ...mapping.get(curr).keys()])
        }, new Set()))

        //optionally sort the indices
        if(index.sortable){
            index = index.sort()
        }
        if(columns.sortable){
            columns = columns.sort()
        }

        //create the values matrix
        const values = index.values.map(index => {
            return columns.values.map(column => {
                if(!mapping.has(index) || !mapping.get(index).has(column)){
                    return NaN
                }
                //retrieve value at index/column
                const group = mapping.get(index).get(column)

                //pass the values
                if(options && options.raw){
                    return callback(group.values, group.index, group.name)
                }
                return callback(new Series(group.values, {index:group.index, name:group.name}))
            })
        })

        return new DataFrame(values, {index:index, columns:columns})
    }
}

export class Rolling extends BaseGrouper{
    apply(callback, options){
        const values = []
        for(let i = 0; i < this.underlying.length; i++){
            if(i < this.options.window - 1){
                values.push(NaN)
            }
            else{
                if(options && options.raw){
                    values.push(callback(this.underlying._values.slice(i - this.options.window + 1, i + 1)))
                }
                else{
                    values.push(callback(this.underlying.islice(i - this.options.window + 1, i + 1)))
                }
            }
        }
        return new Series(values, {index:this.underlying.index, name:this.underlying.name})
    }
}