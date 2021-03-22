import * as utils from '../../core/utils'
import Index      from '../../core/models/Index'
import Series     from '../../core/models/Series'
import DataFrame  from '../../core/models/DataFrame'

describe("instanciation", () => {
    test("base case", () => {
        const df1 = new DataFrame([[1,2,3],[4,5,6]])
        expect(df1).toBeInstanceOf(DataFrame)
        expect(df1.shape).toEqual([2,3])
        expect(df1.values).toEqual([[1,2,3],[4,5,6]])
        expect(df1.index).toBeInstanceOf(Index)
        expect(df1.index.length).toEqual(2)
        expect(df1.columns).toBeInstanceOf(Index)
        expect(df1.columns.length).toEqual(3)
    })

    test("list of series", () => {
        const s1 = new Series([1,2,3])
        const s2 = new Series([4,5,6])
        const df1 = new DataFrame([s1, s2])
        expect(df1.values).toEqual([[1,2,3],[4,5,6]])
        expect(df1.index.values).toEqual([0,1])
        expect(df1.columns.values).toEqual([0,1,2])

        const s3 = new Series([7,8,9], {index:["A","B","C"], name:"X"})
        const df2 = new DataFrame([s1,s3])
        expect(df2.index.values).toEqual([0,"X"])
        expect(df2.columns.values).toEqual([0,1,2,"A","B","C"])
        expect(df2.values).toEqual([[1,2,3,NaN,NaN,NaN],[NaN,NaN,NaN,7,8,9]])
    })
    
    test("empty dataframe", () => {
        const df1 = new DataFrame()
        expect(df1).toBeInstanceOf(DataFrame)
        expect(df1.shape).toEqual([0,0])
        expect(df1.values).toEqual([])
        expect(df1.index).toBeInstanceOf(Index)
        expect(df1.index.length).toEqual(0)
        expect(df1.columns).toBeInstanceOf(Index)
        expect(df1.columns.length).toEqual(0)

        const df2 = new DataFrame([])
        expect(df2).toBeInstanceOf(DataFrame)
        expect(df2.shape).toEqual([0,0])
        expect(df2.values).toEqual([])
        expect(df2.index).toBeInstanceOf(Index)
        expect(df2.index.length).toEqual(0)
        expect(df2.columns).toBeInstanceOf(Index)
        expect(df2.columns.length).toEqual(0)
    })

    test("from another dataframe", () => {
        const df1 = new DataFrame([[1,2,3],[4,5,6]])
        const df2 = new DataFrame(df1)
        expect(df2).toBeInstanceOf(DataFrame)
        expect(df2.values).toEqual(df1.values)
    })

    test("from a Series", () => {
        const df1 = new DataFrame(new Series([1,2,3,4], {name:"test"}))
        expect(df1.shape).toEqual([4,1])
        expect(df1.values).toEqual([[1],[2],[3],[4]])
        expect(df1.index.values).toEqual([0,1,2,3])
        expect(df1.columns.values).toEqual(["test"])

        const df2 = new DataFrame(new Series([1,2,3,4], {name:"test", index:["A","B","C","D"]}))
        expect(df2.index.values).toEqual(["A","B","C","D"])
        expect(df2.columns.values).toEqual(["test"])
    })

    test("from a single list", () => {
        const df1 = new DataFrame([1,2,3,4])
        expect(df1.shape).toEqual([4,1])
        expect(df1.values).toEqual([[1],[2],[3],[4]])
        expect(df1.index.values).toEqual([0,1,2,3])
        expect(df1.columns.values).toEqual([0])
    })

    test("from a single list with index", () => {
        const df1 = new DataFrame([1,2,3,4], {index:["A","B","C","D"]})
        expect(df1.shape).toEqual([4,1])
        expect(df1.values).toEqual([[1],[2],[3],[4]])
        expect(df1.index.values).toEqual(["A","B","C","D"])
        expect(df1.columns.values).toEqual([0])

        const df2 = new DataFrame([1,2,3,4], {columns:["A"]})
        expect(df2.shape).toEqual([4,1])
        expect(df2.values).toEqual([[1],[2],[3],[4]])
        expect(df2.index.values).toEqual([0,1,2,3])
        expect(df2.columns.values).toEqual(["A"])

        const df3 = new DataFrame([1,2,3,4], {index:["A","B","C","D"], columns:["X"]})
        expect(df3.shape).toEqual([4,1])
        expect(df3.values).toEqual([[1],[2],[3],[4]])
        expect(df3.index.values).toEqual(["A","B","C","D"])
        expect(df3.columns.values).toEqual(["X"])
    })

    test("sparse dataframe", () => {
        const df1 = new DataFrame(undefined, {index:utils.range(10),columns:utils.range(5)})
        expect(df1.shape).toEqual([10,5])
        expect(df1.values).toEqual(utils.range(10).map(r => utils.range(5).map(v => NaN)))
    })

    test("constant value", () => {
        const df1 = new DataFrame(7.5, {index:utils.range(10),columns:utils.range(5)})
        expect(df1.shape).toEqual([10,5])
        expect(df1.values).toEqual(utils.range(10).map(r => utils.range(5).map(v => 7.5)))
    })

    test("invalid constructors", () => {
        expect(() => new DataFrame(10, {index:utils.range(10)})).toThrow(Error)
        expect(() => new DataFrame(10, {columns:utils.range(10)})).toThrow(Error)
    })

    test("length mismatch", () => {
        expect(() => new DataFrame([[1,2,3]], {index:[0,1,2,3,4]})).toThrow(Error)
        expect(() => new DataFrame([[1,2,3]], {columns:["A","B"]})).toThrow(Error)
    })
})

describe("rename labels", () => {
    const df1 = new DataFrame(
        [["A1","B1","C1"],["A2","B2","C2"],["A3","B3","C3"]], 
        {index:["1","2","3"], columns:["A","B","C"]}
    )

    test("index axis", () => {
        expect(df1.rename({"1":"0"}).index.values).toEqual(["0","2","3"])
        expect(df1.rename({"1":"0"}, {axis:0}).index.values).toEqual(["0","2","3"])
        expect(df1.rename({"1":"0"}).values).toEqual(df1.values)
    })

    test("columns axis", () => {
        expect(df1.rename({"A":"X"}, {axis:1}).columns.values).toEqual(["X","B","C"])
        expect(df1.rename({"A":"X"}, {axis:1}).index.values).toEqual(["1","2","3"])
        expect(df1.rename({"A":"X"}, {axis:1}).values).toEqual(df1.values)
    })

    test("renaming with function", () => {
        expect(df1.rename(v => 10 * Number(v)).index.values).toEqual([10,20,30])
        expect(df1.rename(v => 10 * Number(v), {axis:0}).index.values).toEqual([10,20,30])
        expect(df1.rename(v => `H${v}`, {axis:1}).columns.values).toEqual(["HA","HB","HC"])
    })

    test("renaming with array", () => {
        expect(df1.rename([10,20,30]).index.values).toEqual([10,20,30])
    })

    test("renaming with object mapping", () => {
        expect(df1.rename({"A":"X"}, {axis:1}).columns.values).toEqual(["X","B","C"])
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