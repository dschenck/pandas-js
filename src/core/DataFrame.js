import { Index }   from './Index'
import { Grouper } from './Grouper'
import { Series }  from './Series'
import * as utils  from './utils'

export class DataFrame{
    constructor(data, options){
        if(data === undefined){
            if(!(options && options.index && options.columns)){
                throw new Error("Constructor called incorrectly")
            }
            this._values = [...options.index].map(r => [...options.columns].map(c => NaN))
        }
        else if(data instanceof DataFrame){
            this._values = data.values
            this.index   = data.index
            this.columns = data.columns 
        }
        else if(data instanceof Series){
            this._values = data._values.map(v => [v])
            this.index   = data.index
            this.columns = data.name !== undefined ? new Index([data.name]) : new Index([0])
        }
        else if(utils.isIterable(data)){
            if(utils.isListOfList(data)){
                this._values = [...data].map(row => [...row])
            }
            else{
                throw new Error("Unsupported data type")
            }
        }
        else{ 
            throw new Error("Constructor not called properly")
        }
        if(options && options.index){
            this.index = options.index
        }
        else if(this._index === undefined){
            this.index = utils.range(this.shape[0])
        }
        if(options && options.columns){
            this.columns = options.columns
        }
        else if(this._columns === undefined){
            this.columns = utils.range(this.shape[1])
        }
    }
    /**
     * Returns a tuple of number of rows, number of columns
     */
    get shape(){
        return [this._values.length, this.values[0].length]
    }
    /**
     * Returns the index
     */
    get index(){
        return this._index
    }
    /**
     * Sets a new index
     */
    set index(index){
        if(index.length !== this.shape[0]){
            throw new Error(`Length mismatch: received ${index.length}, expected ${this.shape[0]}`)
        }
        this._index = new Index(index)
    }
    /**
     * Returns the columns index
     */
    get columns(){
        return this._columns
    }
    /**
     * Sets the columns index
     */
    set columns(index){
        if(index.length !== this.shape[1]){
            throw new Error(`Length mismatch: received ${index.length}, expected ${this.shape[1]}`)
        }
        this._columns = new Index(index)
    }
    /**
     * Get the dataframe values as a list of list
     */
    get values(){
        return this._values.map(row => [...row])
    }
    /**
     * Retrieve data by label(s)
     * @param {*} options 
     */
    loc(options){
        if(arguments.length == 2){
            if(this.index.has(arguments[0]) && this.columns.has(arguments[1])){
                return this.loc({row:arguments[0], column:arguments[1]})
            }
            throw new Error(".loc called incorrectly")
        }
        if(options.row && options.column){
            return this._values[this.index.loc(options.row)][this.columns.loc(options.column)]
        }
        if(options.row && options.columns){
            return new Series([...options.columns].map(c => {
                return this._values[this.index.loc(options.row)][this.columns.loc(c)]
            }), {name:options.row, index:options.columns})
        }
        if(options.row){
            return new Series(this._values[this.index.loc(options.row)], 
                {index:this.columns, name:options.row})
        }
        if(options.rows && options.column){
            return new Series([...options.rows].map(r => {
                return this._values[this.index.loc(r)][this.columns.loc(options.column)]
            }), {name:options.column, index:options.rows})
        }
        if(options.rows && options.columns){
            return new DataFrame([...options.rows].map(r => {
                return [...options.columns].map(c => this._values[this.index.loc(r)][this.columns.loc(c)])
            }), {index:options.rows, columns:options.columns})
        }
        if(options.rows){
            return new DataFrame([...options.rows].map(r => {
                return [...this._values[this.index.loc(r)]]
            }), {index:options.rows, columns:this.columns})
        }
        if(options.columns){
            return new DataFrame(this._values.map(row => {
                return [...options.columns].map(c => row[this.columns.loc(c)])
            }), {index:this.index, columns:options.columns})
        }
        if(options.column){
            return new Series(this._values.map(row => row[this.columns.loc(options.column)]), 
                {name:options.column, index:this.index})
        }
    }
    /**
     * Retrieve data by position(s)
     * @param {*} options 
     */
    iloc(options){
        if(arguments.length == 2){
            if(utils.isNumber(arguments[0]) && utils.isNumber(arguments[1])){
                return this.iloc({row:arguments[0], column:arguments[1]})
            }
            throw new Error(".iloc called incorrectly")
        }
        if("row" in options){
            if(options.row < 0) options.row = this.shape[0] + options.row
            if(options.row >= this.shape[0]) throw new Error("Out of range")
        }
        if("column" in options){
            if(options.column < 0) options.column = this.shape[1] + options.column
            if(options.column >= this.shape[1]) throw new Error("Out of range")
        }
        if("row" in options && "column" in options){
            return this._values[options.row][options.column]
        }
        if("row" in options && "columns" in options){
            return new Series([...options.columns].map(c => this.iloc({row:options.row, column:c})), 
                {name:this.index.at(options.row), index:this.columns.iloc(options.columns)})
        }
        if("row" in options){
            return new Series(this._values[options.row], 
                {index:this.columns, name:this.index.at(options.row)})
        }
        if("rows" in options && "column" in options){
            return new Series(options.rows.map(r => this.iloc({row:r, column:options.column})),
                {name:this.columns.at(options.column), index:this.index.iloc(options.rows)})
        }
        if("rows" in options && "columns" in options){
            return new DataFrame(options.rows.map(r => {
                return options.columns.map(c => this.iloc({row:r, column:c}))
            }), {index:this.index.iloc(options.rows), columns:this.columns.iloc(options.columns)})
        }
        if("rows" in options){
            return new DataFrame(options.rows.map(r => {
                return utils.range(this.shape[1]).map(c => this.iloc({row:r, column:c}))
            }), {index:this.index.iloc(options.rows), columns:this.columns})
        }
        if("columns" in options){
            return new DataFrame(utils.range(this.shape[0]).map(r => {
                return options.columns.map(c => this.iloc({row:r, column:c}))
            }), {index:this.index, columns:this.columns.iloc(options.columns)})
        }
        if("column" in options){
            return new Series(this._values.map(row => row[options.column]), 
                {index:this.index, name:this.columns.at(options.column)})
        }
    }

    /**
     * Returns the transpose of the dataframe
     */
    transpose(){
        return new DataFrame(utils.transpose(this._values), {index:this.columns, columns:this.index})
    }

    /**
     * Maps each value of the dataframe
     * 
     * @param {*} callback 
     */
    map(callback){
        return new DataFrame(this._values.map(row => row.map(callback)), 
            {index:this.index, columns:this.columns})
    }

    /**
     * Reduces values in the given axis to a point
     */
    reduce(callback, initvalue, options){
        if(options && options.axis == 1){
            return new Series(this._values.map(row => row.reduce(callback, initvalue)), 
                {index:this.index, name:options.name})
        }
        return new Series(utils.transpose(this._values).map(row => row.reduce(callback, initvalue)), 
            {index:this.columns, name:options ? options.name : undefined})
    }
}