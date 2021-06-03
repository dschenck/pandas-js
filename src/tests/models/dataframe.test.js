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

        const df3 = new DataFrame([], {index:[], columns:["A","B","C"]})
        expect(df3).toBeInstanceOf(DataFrame)
        expect(df3.shape).toEqual([0,3])
        expect(df3.values).toEqual([])
        expect(df3.index).toBeInstanceOf(Index)
        expect(df3.index.length).toEqual(0)
        expect(df3.columns).toBeInstanceOf(Index)
        expect(df3.columns.length).toEqual(3)

        const df4 = new DataFrame([[],[],[]], {index:["A","B","C"]})
        expect(df4).toBeInstanceOf(DataFrame)
        expect(df4.shape).toEqual([3,0])
        expect(df4.values).toEqual([[],[],[]])
        expect(df4.index).toBeInstanceOf(Index)
        expect(df4.index.length).toEqual(3)
        expect(df4.columns).toBeInstanceOf(Index)
        expect(df4.columns.length).toEqual(0)
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

describe("at", () => {
    const df1 = new DataFrame(
        [["A1","B1","C1"],["A2","B2","C2"],["A3","B3","C3"]], 
        {index:["1","2","3"], columns:["A","B","C"]}
    )
    test("base case", () => {
        expect(df1.at("2","B")).toEqual("B2")
    })
    test("error", () => {
        expect(() => df1.at("2", "X")).toThrow(Error)
    })
})

describe("iat", () => {
    const df1 = new DataFrame(
        [["A1","B1","C1"],["A2","B2","C2"],["A3","B3","C3"]], 
        {index:["1","2","3"], columns:["A","B","C"]}
    )
    test("base case", () => {
        expect(df1.iat(0,0)).toEqual("A1")
        expect(df1.iat(0,1)).toEqual("B1")
        expect(df1.iat(1,1)).toEqual("B2")
        expect(df1.iat(2,2)).toEqual("C3")
    })
    test("error (out of range)", () => {
        expect(() => df1.iat(3,3)).toThrow(Error)
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

describe("slicing by labels", () => {
    const df1 = new DataFrame([[-1, 0, 1],[-2, 4, 1],[10, -9, 5]], 
        {index:[1,2,3], columns:["A","B","C"]})

    test("base case (axis=0)", () => {
        expect(df1.slice(1,3).index.values).toEqual([1,2])
        expect(df1.slice(1,3).columns.values).toEqual(df1.columns.values)
        expect(df1.slice(1,3).values).toEqual([[-1, 0, 1],[-2, 4, 1]])

        expect(df1.slice(1,3, {axis:0}).index.values).toEqual([1,2])
        expect(df1.slice(1,3, {axis:0}).columns.values).toEqual(df1.columns.values)
        expect(df1.slice(1,3, {axis:0}).values).toEqual([[-1, 0, 1],[-2, 4, 1]])

        expect(df1.slice(null,3).index.values).toEqual([1,2])
        expect(df1.slice(null,3).columns.values).toEqual(df1.columns.values)
        expect(df1.slice(null,3).values).toEqual([[-1, 0, 1],[-2, 4, 1]])

        expect(df1.slice(2).index.values).toEqual([2,3])
        expect(df1.slice(2).columns.values).toEqual(df1.columns.values)
        expect(df1.slice(2).values).toEqual([[-2, 4, 1],[10, -9, 5]])

        expect(df1.slice(10).index.values).toEqual([])
        expect(df1.slice(10).columns.values).toEqual(df1.columns.values)
        expect(df1.slice(10).shape).toEqual([0,3])

        expect(df1.slice(1,2).index.values).toEqual([1])
        expect(df1.slice(1,2).columns.values).toEqual(df1.columns.values)
        expect(df1.slice(1,2).values).toEqual([[-1, 0, 1]])
    })

    //const df1 = new DataFrame([[-1, 0, 1],[-2, 4, 1],[10, -9, 5]], 
    //   {index:[1,2,3], columns:["A","B","C"]})

    test("base case (axis=1)", () => {
        expect(df1.slice("A","C", {axis:1}).index.values).toEqual(df1.index.values)
        expect(df1.slice("A","C", {axis:1}).columns.values).toEqual(["A","B"])
        expect(df1.slice("A","C", {axis:1}).values).toEqual([[-1,0],[-2,4],[10, -9]])
    })
})

describe("slicing by position", () => {
    const df1 = new DataFrame([[-1, 0, 1],[-2, 4, 1],[10, -9, 5]], 
        {index:[1,2,3], columns:["A","B","C"]})

    test("base case (axis=0)", () => {
        expect(df1.islice(0,2).index.values).toEqual([1,2])
        expect(df1.islice(0,2).columns.values).toEqual(df1.columns.values)
        expect(df1.islice(0,2).values).toEqual([[-1, 0, 1],[-2, 4, 1]])

        expect(df1.islice(0,2, {axis:0}).index.values).toEqual([1,2])
        expect(df1.islice(0,2, {axis:0}).columns.values).toEqual(df1.columns.values)
        expect(df1.islice(0,2, {axis:0}).values).toEqual([[-1, 0, 1],[-2, 4, 1]])

        expect(df1.islice(null,2).index.values).toEqual([1,2])
        expect(df1.islice(null,2).columns.values).toEqual(df1.columns.values)
        expect(df1.islice(null,2).values).toEqual([[-1, 0, 1],[-2, 4, 1]])

        expect(df1.islice(1).index.values).toEqual([2,3])
        expect(df1.islice(1).columns.values).toEqual(df1.columns.values)
        expect(df1.islice(1).values).toEqual([[-2, 4, 1],[10, -9, 5]])

        expect(() => df1.islice(10)).toThrow(Error)

        expect(df1.islice(0,1).index.values).toEqual([1])
        expect(df1.islice(0,1).columns.values).toEqual(df1.columns.values)
        expect(df1.islice(0,1).values).toEqual([[-1, 0, 1]])
    })

    test("base case (axis=1)", () => {
        expect(df1.islice(0,2, {axis:1}).index.values).toEqual(df1.index.values)
        expect(df1.islice(0,2, {axis:1}).columns.values).toEqual(["A","B"])
        expect(df1.islice(0,2, {axis:1}).values).toEqual([[-1,0],[-2,4],[10, -9]])
    })
})

describe("asof", () => {
    const df1 = new DataFrame([[-1, 0, 1],[-2, 4, 1],[10, -9, 5]], 
        {index:[1,2,3], columns:["A","B","C"]}
    )

    test("base case (axis=0)", () => {
        expect(df1.asof(1.5).values).toEqual([-1,0,1])
        expect(df1.asof(1.5).name).toEqual(1)
        expect(df1.asof(1).name).toEqual(1)
        expect(() => ef1.asof(0)).toThrow(Error)
        expect(df1.asof(99).values).toEqual([10,-9,5])
    })

    test("base case (axis=1)", () => {
        expect(df1.asof("BBB", {axis:1}).values).toEqual([0,4,-9])
        expect(df1.asof("BBB", {axis:1}).name).toEqual("B")
        expect(df1.asof("ZZZ", {axis:1}).values).toEqual([1,1,5])
        expect(df1.asof("ZZZ", {axis:1}).name).toEqual("C")
    })
})

describe("reindexing", () => {
    const df1 = new DataFrame([[-1, 0, 1],[-2, 4, 1],[10, -9, 5]], 
        {index:[1,2,3], columns:["A","B","C"]}
    )

    test("base case (axis = 0)", () => {
        const df2 = df1.reindex([3,1,-1])
        expect(df2.index.values).toEqual([3,1,-1])
        expect(df2.values).toEqual([[10,-9,5],[-1,0,1],[NaN,NaN,NaN]])
        expect(df2.columns.values).toEqual(df1.columns.values)
    })

    test("base case (axis=1)", () => {
        const df2 = df1.reindex(["C","A","X"], {axis:1})
        expect(df2.index.values).toEqual(df1.index.values)
        expect(df2.columns.values).toEqual(["C","A","X"])
        expect(df2.values).toEqual([[1,-1,NaN],[1,-2,NaN],[5,10,NaN]])
    })

    test("filling with a specific value", () => {
        const df2 = df1.reindex([3,1,-9], {fillna:"XXX"})
        expect(df2.values).toEqual([[10,-9,5],[-1,0,1],["XXX","XXX","XXX"]])
    })

    test("forward filling", () => {
        const df2 = df1.reindex([2,1,-9,4], {fillna:"ffill"})
        expect(df2.index.values).toEqual([2,1,-9,4])
        expect(df2.values).toEqual([[-2,4,1],[-1,0,1],[NaN,NaN,NaN],[10,-9,5]])
    })
})

describe("combine", () => {
    const df1 = new DataFrame(
        [["A1","B1","C1","D1"],["A2","B2","C2","D2"],["A3","B3","C3","D3"]], 
        {index:["1","2","3"], columns:["A","B","C","D"]}
    )
    test("combine with a scalar", () => {
        const df2 = df1.combine("X", (a, b) => a + b)

        expect(df2.index.values).toEqual(df1.index.values)
        expect(df2.columns.values).toEqual(df1.columns.values)
        expect(df2.values).toEqual([["A1X","B1X","C1X","D1X"],["A2X","B2X","C2X","D2X"],["A3X","B3X","C3X","D3X"]])
    })
    test("combine with an array (axis=0)", () => {
        const df2 = df1.combine([1,2,3], (a, b) => a[0] == "A" ? b : a)

        expect(df2.index.values).toEqual(df1.index.values)
        expect(df2.columns.values).toEqual(df1.columns.values)
        expect(df2.values).toEqual([[1,"B1","C1","D1"],[2,"B2","C2","D2"],[3,"B3","C3","D3"]])

        //explicit the axis
        const df3 = df1.combine([1,2,3], (a, b) => a[0] == "A" ? b : a, {axis:0})

        expect(df3.index.values).toEqual(df1.index.values)
        expect(df3.columns.values).toEqual(df1.columns.values)
        expect(df3.values).toEqual([[1,"B1","C1","D1"],[2,"B2","C2","D2"],[3,"B3","C3","D3"]])

        //length mismatch
        expect(() => df1.combine([1,2,3,4], (a, b) => a)).toThrow(Error)
        expect(() => df1.combine([1,2,3,4], (a, b) => a, {axis:0})).toThrow(Error)
    })
    test("combine with an array (axis=1)", () => {
        const df2 = df1.combine([1,2,3,4], (a, b) => a[a.length-1] == "1" ? b : a, {axis:1})

        expect(df2.index.values).toEqual(df1.index.values)
        expect(df2.columns.values).toEqual(df1.columns.values)
        expect(df2.values).toEqual([[1,2,3,4],["A2","B2","C2","D2"],["A3","B3","C3","D3"]])

        //length mismatch
        expect(() => df1.combine([1], (a, b) => a, {axis:1})).toThrow(Error)
    })

    test("combine with another dataframe", () => {
        const df2 = df1.map(value => value[value.length - 1])
        const df3 = df1.combine(df2, (a, b) => a + b)

        expect(df3.index.values).toEqual(df1.index.values)
        expect(df3.columns.values).toEqual(df1.columns.values)
        expect(df3.values).toEqual([["A11","B11","C11","D11"],["A22","B22","C22","D22"],["A33","B33","C33","D33"]])

        //reindexing
        const df4 = new DataFrame(
            [["C2","D2","E2","F2"],["C3","D3","E3","F3"],["C4","D4","E4","F4"]], 
            {index:["2","3","4"], columns:["C","D","E","F"]}
        ) 
        const df5 = df1.combine(df4, (a, b) => a)

        expect(df5.index.values).toEqual(["1","2","3","4"])
        expect(df5.columns.values).toEqual(["A","B","C","D","E","F"])
        expect(df5.values).toEqual([
            [NaN,NaN,NaN,NaN,NaN,NaN],
            [NaN,NaN,"C2","D2",NaN,NaN],
            [NaN,NaN,"C3","D3",NaN,NaN],
            [NaN,NaN,NaN,NaN,NaN,NaN]
        ])

        //ignore index
        const df6 = df1.combine(df4, (a, b) => a + b, {"ignore axis":true})
        expect(df6.index.values).toEqual(["1","2","3"])
        expect(df6.columns.values).toEqual(["A","B","C","D"])
        expect(df6.values).toEqual([
            ["A1C2","B1D2","C1E2","D1F2"],
            ["A2C3","B2D3","C2E3","D2F3"],
            ["A3C4","B3D4","C3E4","D3F4"]
        ])

        //size mismatch
        expect(() => df1.combine(DataFrame([[1,2,3],[4,5,6]]), (a, b) => a, {"ignore axis":true})).toThrow(Error)
    })

    test("combine with a Series", () => {
        const srs = new Series([3,2,1], {index:df1.index})
        const df2 = df1.combine(srs, (a, b) => a[0] == "A" ? b : a)

        expect(df2.index.values).toEqual(df1.index.values)
        expect(df2.columns.values).toEqual(df1.columns.values)
        expect(df2.values).toEqual([[3,"B1","C1","D1"],[2,"B2","C2","D2"],[1,"B3","C3","D3"]])

        //explicit the axis
        const df3 = df1.combine(srs, (a, b) => a[0] == "A" ? b : a, {axis:0})

        expect(df3.index.values).toEqual(df1.index.values)
        expect(df3.columns.values).toEqual(df1.columns.values)
        expect(df3.values).toEqual([[3,"B1","C1","D1"],[2,"B2","C2","D2"],[1,"B3","C3","D3"]])
    })

})

describe("reducers", () => {
    const df1 = new DataFrame([[-1, 0, 1],[-2, 4, 1],[10, -9, 5]], 
                        {index:["1","2","3"], columns:["A","B","C"]})

    test("min", () => {
        expect(df1.min({axis:1}).values).toEqual([-1,-2,-9])
    })
})