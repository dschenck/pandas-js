import Index     from '../core/Index'
import Series    from '../core/Series'
import DataFrame from '../core/DataFrame'
import * as utils    from '../core/utils'

describe("instanciation", () => {
    const df1 = new DataFrame([[1,2,3],[4,5,6]])

    test("instance of", () => {
        expect(df1).toBeInstanceOf(DataFrame)
    })

    test("shape", () => {
        expect(df1.shape).toEqual([2,3])
    })

    test("indices", () => {
        expect(df1.index).toBeInstanceOf(Index)
        expect(df1.columns).toBeInstanceOf(Index)
    })

    test("instanciation from another dataframe", () => {
        expect(new DataFrame(df1)).toBeInstanceOf(DataFrame)
        expect((new DataFrame(df1)).values).toEqual(df1.values)
    })

    test("instanciation from a series", () => {
        const df2 = new DataFrame(new Series([1,2,3,4,5], {name:"df2"}))
        
        expect(df2.shape).toEqual([5,1])
        expect(df2.index.values).toEqual([0,1,2,3,4])
        expect(df2.columns.values).toEqual(["df2"])
    })

    test("empty dataframe with indices", () => {
        const df3 = new DataFrame(undefined, {index:utils.range(10),columns:utils.range(5)})

        expect(df3.shape).toEqual([10,5])
        expect(df3.iloc({row:0,column:0})).toEqual(NaN)
    })

    test("instanciation with indices", () =>{
        const df4 = new DataFrame([["A1","B1","C1"],["A2","B2","C2"],["A3","B3","C3"]], 
                                    {index:["1","2","3"], columns:["A","B","C"]})
        
        expect(df4.columns.values).toEqual(["A","B","C"])
        expect(df4.index.values).toEqual(["1","2","3"])
    })
})

describe("accessing data via label", () => {
    const df1 = new DataFrame([["A1","B1","C1"],["A2","B2","C2"],["A3","B3","C3"]], 
                        {index:["1","2","3"], columns:["A","B","C"]})

    test("1 row x 1 col", () => {
        expect(df1.loc("1","A")).toEqual("A1")
        expect(df1.loc({row:"2", column:"C"})).toEqual("C2")
    })

    test("1 column", () => {
        expect(df1.loc({column:"A"})).toBeInstanceOf(Series)
        expect(df1.loc({column:"A"}).values).toEqual(["A1","A2","A3"])
        expect(df1.loc({column:"A"}).index.values).toEqual(["1","2","3"])
        expect(df1.loc({column:"A"}).name).toEqual("A")

    })

    test("1 row", () => {
        expect(df1.loc({row:"3"})).toBeInstanceOf(Series)
        expect(df1.loc({row:"3"}).values).toEqual(["A3","B3","C3"])
        expect(df1.loc({row:"3"}).index.values).toEqual(["A","B","C"])
        expect(df1.loc({row:"3"}).name).toEqual("3")

    })

    test("2 rows", () => {
        expect(df1.loc({rows:["1","2"]})).toBeInstanceOf(DataFrame)
        expect(df1.loc({rows:["1","2"]}).index.values).toEqual(["1","2"])
    })

    test("2 rows x 1 column", () => {
        expect(df1.loc({rows:["1","3"],column:"B"})).toBeInstanceOf(Series)
        expect(df1.loc({rows:["1","3"],column:"B"}).name).toEqual("B")
    })

    test("2 columns", () => {
        expect(df1.loc({columns:["A","C"]})).toBeInstanceOf(DataFrame)
    })

    test("1 row x 2 columns", () => {
        expect(df1.loc({row:"2",columns:["A","C"]})).toBeInstanceOf(Series)
        expect(df1.loc({row:"2",columns:["A","C"]}).name).toEqual("2")
    })
    
})

describe("accessing data via position", () => {
    const df1 = new DataFrame([["A1","B1","C1"],["A2","B2","C2"],["A3","B3","C3"]], 
                        {index:["1","2","3"], columns:["A","B","C"]})

    test("1 row x 1 col", () => {
        expect(df1.iloc(0,0)).toEqual("A1")
        expect(df1.iloc({row:0,column:0})).toEqual("A1")
        expect(df1.iloc(-1,-1)).toEqual("C3")
    })

    test("1 row or column only", () => {
        expect(df1.iloc({row:1})).toBeInstanceOf(Series)
        expect(df1.iloc({row:1}).name).toEqual("2")
        expect(df1.iloc({row:0}).index.values).toEqual(["A","B","C"])

        expect(df1.iloc({column:-2})).toBeInstanceOf(Series)
        expect(df1.iloc({column:-2}).name).toEqual("B")
        expect(df1.iloc({column:2}).index.values).toEqual(["1","2","3"])
    })

    test("1 row x 2 columns", () => {
        expect(df1.iloc({row:1,columns:[0,2]})).toBeInstanceOf(Series)
        expect(df1.iloc({row:1,columns:[0,2]}).name).toEqual("2")
        expect(df1.iloc({row:1,columns:[0,2]}).index.values).toEqual(["A","C"])
    })

    test("2 rows x 1 column", () => {
        expect(df1.iloc({rows:[0,-1],column:-2})).toBeInstanceOf(Series)
        expect(df1.iloc({rows:[0,-1],column:-2}).name).toEqual("B")
        expect(df1.iloc({rows:[0,-1],column:-2}).index.values).toEqual(["1","3"])
    })

    test("2 rows x 2 columns", () => {
        expect(df1.iloc({rows:[0,2],columns:[0,-2]})).toBeInstanceOf(DataFrame)
    })
})

describe("reducers", () => {
    const df1 = new DataFrame([[-1, 0, 1],[-2, 4, 1],[10, -9, 5]], 
                        {index:["1","2","3"], columns:["A","B","C"]})

    test("min", () => {
        expect(df1.min({axis:1}).values).toEqual([-1,-2,-9])
    })
})