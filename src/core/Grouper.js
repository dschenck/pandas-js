export class Grouper{
    constructor(underlying){
        this.underlying = underlying
        this.groups     = new Map()
    }
    add(group, index, value){
        if(!this.groups.has(group)) this.groups[group] = [[],[]]
        this.groups[group][0].push(index)
        this.groups[group][1].push(value)
        return
    }
    apply(callback, options){
        const values = this.groups.keys().map(key => {
            if(options && options.raw){
                return callback(this.groups.get(key)[1])
            }
            return callback(new Series(this.groups.get(key)[1], {index:this.groups.get(key)[0], name:key}))
        })
        return new Series(values, {index:this.groups.keys(), name:this.underlying.name})
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