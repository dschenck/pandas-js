import Immutable       from 'immutable'
import { Series }      from '../core/Series'
import { Axis }       from '../core/Axes'
import * as exceptions from '../core/Exceptions'
import * as utils      from '../core/utils'

let s1 = new Series([0,1,2,3,4,5,6,7], {name:'integers', index:["A","B","C","D","E","F","G","H"]})

describe('Creating a new series', () => {
    test('without any data', ()=> {
        let s = new Series()
        expect(s).toBeInstanceOf(Series)
        expect(s.length).toBe(0)
        expect(s.index).toBeInstanceOf(Axis)
        expect(s.index.length).toBe(0)
        expect(s.name).toBe(undefined)
    })
    test('with data but no index', () => {
        let s = new Series(["A","B","C"])
        expect(s).toBeInstanceOf(Series)
        expect(s.length).toBe(3)
        expect(s.name).toBe(undefined)
        expect(s.index).toBeInstanceOf(Axis)
        expect(s.index.values.toArray()).toEqual([0,1,2])
    })
    test('with a name', () => {
        let s = new Series(["A","B","C"], {name:"test"})
        expect(s.name).toBe('test')
    })
    test('wrong-formed data', () => {
        expect(() => new Series("-")).toThrow(TypeError)
       expect(() => new Series([1,2,3], {index:[1,2,3,4]})).toThrow(Error)
    })
})

describe('Changing the index in-place', () => {
    test('altering the index', () => {
        let s = new Series([1,2,3])
            s.index = [9,8,7]
        expect(s.index.values.toArray()).toEqual([9,8,7])
    })
})

describe('Axising by value', () => {
    test('requesting a single label', () => {
        let s = new Series([0,1,2,3,4,5,6], {index:["A",9,true,false,null,undefined,NaN]})
        expect(s.loc("A")).toBe(0)
        expect(s.loc(9)).toBe(1)
        expect(s.loc(true)).toBe(2)
        expect(s.loc(false)).toBe(3)
        expect(s.loc(null)).toBe(4)
        expect(s.loc(undefined)).toBe(5)
        expect(s.loc(NaN)).toBe(6)
    })
    test('requesting several labels at once', () => {
        let s = new Series([0,1,2,3,4,5,6], {index:["A",9,true,false,null,undefined,NaN]})
        expect(s.loc(["A",9,true,false])).toEqual([0,1,2,3])
    })
    test('requesting a non-existent key', () => {
        let s = new Series([0,1,2,3])
        expect(() => s.loc("missing")).toThrow(Error)
    })
})

describe('Axising by position', () => {
    test('requesting a single label', () => {
        let s = new Series([0,1,2,3,4,5,6], {index:["A",9,true,false,null,undefined,NaN]})
        expect(s.iloc(0)).toBe(0)
        expect(s.iloc(1)).toBe(1)
        expect(s.iloc(2)).toBe(2)
        expect(s.iloc(3)).toBe(3)
        expect(s.iloc(-3)).toBe(4)
        expect(s.iloc(-2)).toBe(5)
        expect(s.iloc(-1)).toBe(6)
    })
    test('indexing out of bounds', () => {
        let s = new Series([0,1,2,3])
        expect(() => s.iloc(5)).toThrow(Error)
        expect(() => s.iloc(-5)).toThrow(Error)
    })
})

describe('Slicing', () => {
    test('simple slicing', () => {
        let s = new Series([0,1,2,3,4,5,6,7])
        expect(s.slice(0,1).values.toArray()).toEqual([0])
        expect(s.slice(-1,).values.toArray()).toEqual([7])
        expect(s.slice(0,-4).values.toArray()).toEqual([0,1,2,3])
        expect(s.slice(-4,-1).values.toArray()).toEqual([4,5,6])
        expect(s.slice(0, s.length).length).toBe(s.length)
    })
    test('out of bounds error', () => {
        let s = new Series([0,1,2,3,4,5,6,7])
        expect(() => s.slice(9)).toThrow(Error)
        expect(() => s.slice(-9)).toThrow(Error)
    })
})

describe('Typing', () => {
    test('as string', () => {
        let s = new Series([0,1,2])
        expect(s.astype('string').values.toArray()).toEqual(["0", "1", "2"])
    })
    test('as numbers', () => {
        let s = new Series([0, 3/4, true, false, "A", null, undefined, NaN])
        expect(s.astype('number').values.toArray()).toEqual([0, 3/4, 1, 0, NaN, 0, NaN, NaN])
    })
    test('as boolean', () => {
        let s = new Series(["A", 0, 1, true, false, NaN, undefined, null])
        expect(s.astype('boolean').values.toArray()).toEqual([
            true, false, true, true, false, false, false, false
        ])
    })
})

describe('missing values', () => {
    test('finding missing values', () => {
        let s = new Series(["A", 0, 1, true, false, NaN, undefined, null])
        expect(s.isNA().sum()).toBe(3)
        expect(s.isNaN().sum()).toBe(4)
    })
    test('dropping missing values', () => {
        let s = new Series(["A", 0, 1, true, false, NaN, undefined, null])
        expect(s.dropna().length).toBe(5)
    })
    test('filling missing values', () => {
        let s = new Series(["A", 0, 1, true, false, NaN, undefined, null])
        expect(s.fillna({method:"ffill"}).values.toArray()).toEqual([
            "A", 0, 1, true, false, false, false, false
        ])
        expect(s.fillna({method:"bfill"}).values.toArray()).toEqual([
            "A", 0, 1, true, false, NaN,NaN,NaN
        ])
        expect(s.fillna({value:"X"}).values.toArray()).toEqual([
            "A", 0, 1, true, false, "X", "X", "X"
        ])
    })
})

describe('boolean series', () => {
    test('logical operations', () => {
        let s1 = new Series([true, true, false])
        expect(s1.all()).toBe(false)
        expect(s1.any()).toBe(true)

        let s2 = new Series([true, true, true])
        expect(s2.all()).toBe(true)
        expect(s2.any()).toBe(true)

        let s3 = new Series([false, false, false])
        expect(s3.all()).toBe(false)
        expect(s3.any()).toBe(false)
    })
})

describe('masking', () => {
    test('with boolean array', () => {
        let s = new Series([0,1,2,3,4])
        expect(s.mask([true,true,false,false,true]).length).toBe(3)
    })
})

describe('descriptive statistics', () => {
    test('sum, count and mean', () => {
        let s1 = new Series([0,1,2,3,4])
        expect(s1.sum()).toBe(10)
        expect(s1.count()).toBe(5)
        expect(s1.mean()).toBe(2)

        let s2 = new Series([0,1,2,3,NaN,"A"])
        expect(s2.sum()).toBe(6)
        expect(s2.sum(false)).toBe(NaN)
        expect(s2.count()).toBe(4)
        expect(s2.count(false)).toBe(5)
        expect(s2.mean(false)).toBe(NaN)

        let s3 = new Series(["A", 1, 2.5, true, false, NaN, undefined, Infinity, -Infinity, null])
        expect(s3.sum()).toBe(4.5)
        expect(s3.count()).toBe(4)
        expect(s3.mean()).toBe(1.125)
        expect(s3.mean(false)).toBe(NaN)
    })

    test('min and max', () => {
        let s3 = new Series(["A", 1, 2.5, true, false, NaN, undefined, Infinity, -Infinity, null])
        expect(s3.min()).toBe(0)
        expect(s3.min(false)).toBe(NaN)
        expect(s3.max()).toBe(2.5)
        expect(s3.max(false)).toBe(NaN)
    })
})

describe('cumulative operations', () => {
    test('cumulative sum', () => {
        let s1 = new Series([1,2,3,4,5])
        expect(s1.cumsum().values).toEqual(Immutable.List([1,3,6,10,15]))

        let s2 = new Series([NaN,1,2,3,NaN,5])
        expect(s2.cumsum().values).toEqual(Immutable.List([NaN,1,3,6,6,11]))
        expect(s2.cumsum(false).values).toEqual(Immutable.List([NaN, NaN, NaN, NaN, NaN, NaN]))

        let s3 = new Series([1,2,3,NaN,4])
        expect(s3.cumsum(false).values).toEqual(Immutable.List([1, 3, 6, NaN, NaN]))
    })
    test('cumulative product', () => {
        let s1 = new Series([1,2,3,4,5])
        expect(s1.cumprod().values).toEqual(Immutable.List([1,2,6,24,120]))

        let s2 = new Series([NaN,1,2,3,NaN,5])
        expect(s2.cumprod().values).toEqual(Immutable.List([NaN,1,2,6,6,30]))
        expect(s2.cumprod(false).values).toEqual(Immutable.List([NaN, NaN, NaN, NaN, NaN, NaN]))

        let s3 = new Series([1,2,3,NaN,4])
        expect(s3.cumprod(false).values).toEqual(Immutable.List([1, 3, 6, NaN, NaN]))
    })
    test('cumulative minimum', () => {
        let s1 = new Series([0,-1,2,-3,5])
        expect(s1.cummin().values).toEqual(Immutable.List([0,-1,-1,-3,-3]))

        let s2 = new Series([NaN,0,-1,2,-3,5])
        expect(s2.cummin().values).toEqual(Immutable.List([NaN,0,-1,-1,-3,-3]))
        expect(s2.cummin(false).values).toEqual(Immutable.List([NaN, NaN, NaN, NaN, NaN, NaN]))

        let s3 = new Series([0,-1,2,-3,NaN,5])
        expect(s3.cummin(false).values).toEqual(Immutable.List([0,-1,-1,-3,NaN,NaN]))
    })
    test('cumulative maximum', () => {
        let s1 = new Series([0,-1,2,-3,5])
        expect(s1.cummax().values).toEqual(Immutable.List([0,0,2,2,5]))

        let s2 = new Series([NaN,0,-1,2,-3,5])
        expect(s2.cummax().values).toEqual(Immutable.List([NaN,0,0,2,2,5]))
        expect(s2.cummax(false).values).toEqual(Immutable.List([NaN, NaN, NaN, NaN, NaN, NaN]))

        let s3 = new Series([0,-1,2,-3,NaN,5])
        expect(s3.cummax(false).values).toEqual(Immutable.List([0,0,2,2,NaN,NaN]))
    })
})

describe("arithmetics", () => {
    test('addition', () => {
        let s1 = new Series([NaN, 1, 2, 3, true, false], {index:["A","B","C","D","E","F"]})
        expect(s1.add(1).values).toEqual(Immutable.List([NaN, 2, 3, 4, 2, 1]))
        expect(s1.add(NaN).values).toEqual(Immutable.List([NaN, NaN, NaN, NaN, NaN, NaN]))

        let s2 = new Series([1,2,3, NaN], {index:["F","E","B","C"]})
        expect(s1.add(s2).values).toEqual(Immutable.List([NaN,4,NaN,NaN,3,1]))

        let s3 = [1,1,1,1,1,1]
        expect(s1.add(s3).values).toEqual(Immutable.List([NaN,2,3,4,2,1]))

        let s4 = Immutable.List(s3)
        expect(s1.add(s4).values).toEqual(Immutable.List([NaN,2,3,4,2,1]))

        let s5 = s1.map((value, i) => 5-i)
        expect(s1.add(s5, {"ignore index":true}).values).toEqual(Immutable.List([NaN, 5, 5, 5, 2, 0]))
    })
    test('subtractions', () => {
        let s1 = new Series([NaN, 1, 2, 3, true, false], {index:["A","B","C","D","E","F"]})
        expect(s1.subtract(1).values).toEqual(Immutable.List([NaN, 0, 1, 2, 0, -1]))
        expect(s1.subtract(NaN).values).toEqual(Immutable.List([NaN, NaN, NaN, NaN, NaN, NaN]))

        let s2 = new Series([1,2,3, NaN], {index:["F","E","B","C"]})
        expect(s1.subtract(s2).values).toEqual(Immutable.List([NaN,-2,NaN,NaN,-1,-1]))

        let s3 = [1,1,1,1,1,1]
        expect(s1.subtract(s3).values).toEqual(Immutable.List([NaN, 0, 1, 2, 0, -1]))

        let s4 = Immutable.List(s3)
        expect(s1.subtract(s4).values).toEqual(Immutable.List([NaN, 0, 1, 2, 0, -1]))

        let s5 = s1.map((value, i) => 5-i)
        expect(s1.subtract(s5, {"ignore index":true}).values).toEqual(Immutable.List([NaN, -3, -1, 1, 0, 0]))
    })
    test('multiplications', () => {
        let s1 = new Series([NaN, 1, 2, 3, true, false], {index:["A","B","C","D","E","F"]})
        expect(s1.multiply(-1).values).toEqual(Immutable.List([NaN, -1,-2,-3,-1,-0]))
        expect(s1.multiply(NaN).values).toEqual(Immutable.List([NaN, NaN, NaN, NaN, NaN, NaN]))

        let s2 = new Series([1,2,3, NaN], {index:["F","E","B","C"]})
        expect(s1.multiply(s2).values).toEqual(Immutable.List([NaN,3,NaN,NaN,2,0]))

        let s3 = [1,-1,1,-1,1,-1]
        expect(s1.multiply(s3).values).toEqual(Immutable.List([NaN, -1,2,-3,1,-0]))

        let s4 = Immutable.List(s3)
        expect(s1.multiply(s4).values).toEqual(Immutable.List([NaN, -1,2,-3,1,-0]))
    })
    test('divisions', () => {
        let s1 = new Series([NaN, 1, 2, 3, true, false], {index:["A","B","C","D","E","F"]})
        expect(s1.divide(2).values).toEqual(Immutable.List([NaN,0.5,1,1.5,0.5,0]))
        expect(s1.divide(NaN).values).toEqual(Immutable.List([NaN, NaN, NaN, NaN, NaN, NaN]))

        let s2 = new Series([1,2,-2, NaN], {index:["F","E","B","C"]})
        expect(s1.divide(s2).values).toEqual(Immutable.List([NaN,-0.5,NaN,NaN,0.5,0]))

        let s3 = [1,-1,1,-1,1,-1]
        expect(s1.divide(s3).values).toEqual(Immutable.List([NaN, -1,2,-3,1,-0]))

        let s4 = Immutable.List(s3)
        expect(s1.divide(s4).values).toEqual(Immutable.List([NaN, -1,2,-3,1,-0]))
    })
})

describe("Mapping and filtering", () => {
    test('Filtering', () => {
        let s1 = new Series([0,1,2,3,4,5,6,7], {name:'integers', index:["A","B","C","D","E","F","G","H"]})
        expect(s1.filter(value => value % 2 == 0).values).toEqual(
            Immutable.List([0,2,4,6])
        )
    })
    test('Mapping', () => {
        let s1 = new Series([0,1,2,3,4,5,6,7], {name:'integers', index:["A","B","C","D","E","F","G","H"]})
        expect(s1.map(value => value % 2 == 0).values).toEqual(
            Immutable.List([true,false,true,false,true,false,true,false])
        )
    })
    test('Every n steps', () => {
        let s1 = new Series([0,1,2,3,4,5,6,7], {name:'integers', index:["A","B","C","D","E","F","G","H"]})
        expect(s1.every(2).values).toEqual(
            Immutable.List([0,2,4,6])
        )
        expect(s1.every(2).index.values).toEqual(
            Immutable.List(["A","C","E","G"])
        )
    })
})

describe('Reversing', () => {
    let s1 = new Series([0,1,2,3,4,5,6,7], {index:["A","B","C","D","E","F","G","H"]})
    test('simple reversing', () => {
        expect(s1.reverse().values).toEqual(
            Immutable.List([7,6,5,4,3,2,1,0])
        )
        expect(s1.reverse().loc("A")).toBe(s1.loc("H"))
    })

    test('double-reversing', () => {
        expect(s1.reverse().reverse().values).toEqual(
            s1.values
        )
    })
})

describe('Updating', () => {
    test('conditional witho other series', () => {
        let s1 = new Series([0,1,2,3,4,5,6,7])
        let s2 = s1.reverse()

        expect(s1.where((value => value % 2 == 0), s2).values).toEqual(
            Immutable.List([0,6,2,4,4,2,6,0])
        )
    })
    test('conditional with array', () => {
        let s1 = new Series([0,1,2,3,4,5,6,7])
        let s2 = [-1,-1,-1,-1,-1,-1,-1,-1]

        expect(s1.where((value => value % 2 == 0), s2).values).toEqual(
            Immutable.List([0,-1,2,-1,4,-1,6,-1])
        )
    })
    test('conditional with scalar', () => {
        let s1 = new Series([0,1,2,3,4,5,6,7])

        expect(s1.where((value => value % 2 == 0), NaN).values).toEqual(
            Immutable.List([0,NaN,2,NaN,4,NaN,6,NaN])
        )
    })
})

describe("difference", () => {
    let srs = new Series([0,1,2,3,4,5,6,7,8,9,10])

    test('default diff', () => {
        expect(srs.diff().values).toEqual(
            Immutable.List([NaN,1,1,1,1,1,1,1,1,1,1])
        )
    })
    test('0 difference', () => {
        expect(srs.diff(0).values).toEqual(
            Immutable.List([0,0,0,0,0,0,0,0,0,0,0])
        )
    })
    test('2-step diff', () => {
        expect(srs.diff(2).values).toEqual(
            Immutable.List([NaN,NaN,2,2,2,2,2,2,2,2,2])
        )
    })
})

describe("Shifting", () =>{
    let s1 = new Series([0,1,2,3,4,5,6,7], {index:["A","B","C","D","E","F","G","H"]})
    test("positive offset", () => {
        expect(s1.shift(1).values).toEqual(
            Immutable.List([NaN,0,1,2,3,4,5,6])
        )
        expect(s1.shift(1).index.values).toEqual(
            Immutable.List(["A","B","C","D","E","F","G","H"])
        )
    })
    test("negative offset", () => {
        expect(s1.shift(-1).values).toEqual(
            Immutable.List([1,2,3,4,5,6,7,NaN])
        )
        expect(s1.shift(-1).index.values).toEqual(
            Immutable.List(["A","B","C","D","E","F","G","H"])
        )
    })
    test("0 offset", () => {
        expect(s1.shift(0).values).toEqual(
            s1.values
        )
        expect(s1.shift(0).index.values).toEqual(
            Immutable.List(["A","B","C","D","E","F","G","H"])
        )
    })
    test("wrong argument should throw error", () => {
        expect(() => s1.shift('hi')).toThrow(Error)
    })
})

describe("Dropping a list of labels", () => {
    let s1 = new Series([0,1,2,3,4,5,6,7], {index:["A","B","C","D","E","F","G","H"]})
    test("a single label", () => {
        expect(s1.drop(["A"]).values).toEqual(
            Immutable.List([1,2,3,4,5,6,7])
        )
    })
    test("a few label", () => {
        expect(s1.drop(["A", "B", "F"]).values).toEqual(
            Immutable.List([2,3,4,6,7])
        )
    })
})

describe("Location of min and max", () => {
    let s = new Series([null, 0.25, 3/4, true, false, "A", null, undefined, NaN])
    test("argument of min", () => {
        expect(s.idxmin()).toBe(4)
    })
    test("argument of max", () => {
        expect(s.idxmax()).toBe(3)
    })
})

describe("Is in", () => {
    let s = new Series([null, 0.25, 3/4, true, false, "A", null, undefined, NaN])
    test("value is in", () => {
        expect(s.isin([true,false]).values).toEqual(
            Immutable.List([false,false,false,true,true,false,false,false,false])
        )
    })
})








