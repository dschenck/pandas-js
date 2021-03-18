import * as utils from '../../core/utils'
import Index      from '../../core/models/Index'
import Series     from '../../core/models/Series'

let idx0 = new Index()
let idx1 = new Index(["A","B","C","D","E","F"], {name:"letters"})
let idx2 = new Index(utils.range(100), {name:"numbers"})

describe("instanciation", () => {
    test('index length', () => {
        expect(idx0.length).toBe(0)
        expect(idx1.length).toBe(6)
        expect(idx2.length).toBe(100)
    })

    test('index name should be ', () => {
        expect(idx0.name).toBe(undefined)
        expect(idx1.name).toBe("letters")
        expect(idx2.name).toBe("numbers")
    })

    test("sorted property", () => {
        expect(() => idx0.sorted).toThrow(Error), 
        expect(idx1.sorted).toBe("ascending")
        expect(idx2.sorted).toBe("ascending")

        const idx3 = new Index([10,9,8,7])
        expect(idx3.sorted).toBe("descending")

        const idx4 = new Index([10,5,16,4])
        expect(idx4.sorted).toBe(false)
    })

    test("numeric property", () => {
        expect(() => idx0.numeric).toThrow(Error)
        expect(idx1.numeric).toBe(false)
        expect(idx2.numeric).toBe(true)

        const idx4 = new Index([1,true,false,4])
        expect(idx4.numeric).toBe(true)
    })
})

describe("value lookups", () => {
    test("index should have", () => {
        expect(idx0.has(0)).toBe(false)
        expect(idx1.has("A")).toBe(true)
        expect(idx1.has("Z")).toBe(false)
        expect(idx2.has(50)).toBe(true)
        expect(idx2.has(100)).toBe(false)
    })
})

test("year", () => {
    const idx = new Index([new Date()])
    expect(idx.year()).toBeInstanceOf(Series)
})

describe("index with duplicate labels", () => {
    it("should return false", () => {
        const index = new Index([1,1,2,3])
        expect(index.unique).toBe(false)
    })
    it("should return true", () => {
        const index = new Index([1,0,2,3])
        expect(index.unique).toBe(true)
    })
})

describe("indexing", () => {
    it("should return values", () => {
        expect(idx1.at(0)).toBe("A")
        expect(idx1.at(1)).toBe("B")
        expect(idx1.at(-1)).toBe("F")
        expect(idx1.at(-2)).toBe("E")
    })
    it("should throw an error", () => {
        expect(() => idx0.at(0)).toThrow(Error)
        expect(() => idx1.at(6)).toThrow(Error)
        expect(() => idx1.at(-7)).toThrow(Error)
    })
})

describe("slicing", () => {
    it("should return an axis", () => {
        expect(idx1.islice(0,4)).toBeInstanceOf(Index)
        expect(idx1.islice(0,4).at(0)).toBe("A")
    })
    it("should throw an error", () => {
        expect(() => idx0.islice(0,1)).toThrow(Error)
    })

    test("slicing by label", () => {
        const idx = new Index([1,2,3,4,5,6,7,8,9])

        expect(idx.slice(3,6).values).toEqual([3,4,5])
        expect(idx.slice(3,6).length).toEqual(3)
        expect(idx.slice(null,4).length).toEqual(3)
        expect(idx.slice(4,null).length).toEqual(6)
        expect(idx.slice(4).length).toEqual(6)

        const abc = new Index(["A","B","C","D","E","F"])

        expect(abc.slice("B","E").length).toEqual(3)
        expect(abc.slice("B","E").values).toEqual(["B","C","D"])
    })
})

test('min', () => {
    expect(idx2.min()).toBe(0)
    expect(() => idx0.min()).toThrow(Error)
})

test('max', () => {
    expect(idx2.max()).toBe(99)
    expect(() => idx0.max()).toThrow(Error)
})

test('idxmax', () => {
    expect(idx2.idxmax()).toBe(99)
})

test('reverse', () => {
    expect(idx0.reverse()).toBeInstanceOf(Index)
    expect(idx1.reverse().at(0)).toBe("F")
    expect(idx1.at(0)).toBe("A")
    
    //idx2 is 0...99
    expect(idx2.reverse().at(0)).toBe(99)
    expect(idx2.reverse().at(99)).toBe(0)
})

test("mask", () => {
    expect(idx1.mask([false,true,false,true,false,true])).toBeInstanceOf(Index)
    expect(idx1.mask([false,true,false,true,false,true]).length).toBe(3)
    expect(idx1.mask([false,true,false,true,false,true]).at(0)).toBe("B")
})

test("iterator protocol", () => {
    expect([...idx1]).toEqual(["A","B","C","D","E","F"])
    expect([...idx1][0]).toBe("A")
})

describe("union", () => {
    test("union of two axes", () => {
        const i1 = new Index([1,2,3,4,5,6,7])
        const i2 = new Index([6,7,8,9,10])
        expect(i1.union(i2).values).toEqual([1,2,3,4,5,6,7,8,9,10])
    })
    
    test("union of one axis and one list",() => {
        const i1 = new Index([1,2,3,4,5])
        const i2 = [4,5,6,7,8,9,10]
        expect(i1.union(i2).values).toEqual([1,2,3,4,5,6,7,8,9,10])
    })
})

describe("intersection", () => {
    test("intersection of two axes", () =>{
        const i1 = new Index([1,2,3,4,5,6,7])
        const i2 = new Index([6,7,8,9,10])
        expect(i1.intersection(i2).values).toEqual([6,7])
    })
    test("intersection of one axis and one list",() => {
        const i1 = new Index([1,2,3,4,5])
        const i2 = [4,5,6,7,8,9,10]
        expect(i1.intersection(i2).values).toEqual([4,5])
    })
})

describe("sorting", () => {
    test("numerical index", () => {
        const idx = new Index([1,3,2,5,0,4,10])
        expect(idx.sort().values).toEqual([0,1,2,3,4,5,10])
    })
    test("sort is not inplace", () => {
        const idx = new Index([1,3,2,5,0,4,10])
        expect(idx.values).toEqual([1,3,2,5,0,4,10])
    })
})

describe("asof", () => {
    test("ascending index", () => {
        const idx = new Index([1,3,5,7,9,11])

        expect(idx.asof(1)).toBe(1)
        expect(idx.asof(2)).toBe(1)
        expect(idx.asof(3)).toBe(3)
        expect(idx.asof(11)).toBe(11)
        expect(idx.asof(99)).toBe(11)
        expect(() => idx.asof(0)).toThrow(Error)
    })

    test("descending index", () => {
        const idx = new Index([11,9,7,5,3,1])

        expect(idx.asof(1)).toBe(1)
        expect(idx.asof(2)).toBe(1)
        expect(idx.asof(3)).toBe(3)
        expect(idx.asof(11)).toBe(11)
        expect(idx.asof(99)).toBe(11)
        expect(() => idx.asof(0)).toThrow(Error)
    })

    test("with 0", () => {
        const idx = new Index([0,2,4,6,8,10,12,14,16,18])

        expect(idx.asof(0)).toBe(0)
        expect(idx.asof(1)).toBe(0)
        expect(idx.asof(2)).toBe(2)
    })

    test("unsorted index", () => {
        const idx = new Index([11,9,10,5,7,1])
        expect(() => idx.asof(10)).toThrow(Error)
    })
})

describe("dropping labels", () => {
    test("dropping single value", () => {
        let idx = new Index(["A","B","C","D","E","F"], {name:"letters"})
        expect(idx.drop("A").values).toEqual(["B","C","D","E","F"])
        expect(idx.drop("C").values).toEqual(["A","B","D","E","F"])
    })
    test("dropping a value not in the index", () => {
        let idx = new Index(["A","B","C","D","E","F"], {name:"letters"})
        expect(idx.drop("Z").values).toEqual(idx.values)
    })
    test("dropping a list of labels", () => {
        let idx = new Index(["A","B","C","D","E","F"], {name:"letters"})
        expect(idx.drop(["A","C"]).values).toEqual(["B","D","E","F"])
    })
})

describe("static union", () => {
    test("basic", () => {
        let idx = Index.union([[1,2,3],[2,3,4]], {name:"test"})
        expect(idx.values).toEqual([1,2,3,4])
        expect(idx.name).toEqual("test")
    })
    test("types", () => {
        let idx = Index.union([[1,2,3],new Index([2,3,4])], {name:"test"})
        expect(idx.values).toEqual([1,2,3,4])
    })
    test("default sort", () => {
        let idx = Index.union([[1,2,3],[-2,3,4]], {name:"test"})
        expect(idx.values).toEqual([-2,1,2,3,4])
        expect(idx.name).toEqual("test")
    })
})

describe("static intersection", () => {
    test("basic", () => {
        let idx = Index.intersection([[1,2,3],[2,3,4]], {name:"test"})
        expect(idx.values).toEqual([2,3])
        expect(idx.name).toEqual("test")
    })
    test("types", () => {
        let idx = Index.intersection([[1,2,3],new Index([2,3,4])], {name:"test"})
        expect(idx.values).toEqual([2,3])
    })
    test("default sort", () => {
        let idx = Index.intersection([[3,2,1,-1],[-2,-1,3,4]], {name:"test"})
        expect(idx.values).toEqual([-1,3])
        expect(idx.name).toEqual("test")
    })
})


