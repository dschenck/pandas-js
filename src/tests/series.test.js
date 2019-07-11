import Immutable       from 'immutable'
import { Series }      from '../core/Series'
import { Index }       from '../core/Indices'
import * as exceptions from '../core/Exceptions'

let s1 = new Series([0,1,2,3,4,5,6,7], {name:'integers', index:["A","B","C","D","E","F","G","H"]})

describe('Creating a new series', () => {
    test('without any data', ()=> {
        let s = new Series()
        expect(s).toBeInstanceOf(Series)
        expect(s.length).toBe(0)
        expect(s.index).toBeInstanceOf(Index)
        expect(s.index.length).toBe(0)
        expect(s.name).toBe(undefined)
    })
    test('with data but no index', () => {
        let s = new Series(["A","B","C"])
        expect(s).toBeInstanceOf(Series)
        expect(s.length).toBe(3)
        expect(s.name).toBe(undefined)
        expect(s.index).toBeInstanceOf(Index)
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

describe('Indexing by value', () => {
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
        expect(s.loc("A",9,true,false).toArray()).toEqual([0,1,2,3])
    })
    test('requesting a non-existent key', () => {
        let s = new Series([0,1,2,3])
        expect(() => s.loc("missing")).toThrow(Error)
    })
})

describe('Indexing by position', () => {
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
        expect(s.isNA().sum()).toBe(2)
        expect(s.isNaN().sum()).toBe(3)
    })
    test('dropping missing values', () => {
        let s = new Series(["A", 0, 1, true, false, NaN, undefined, null])
        expect(s.dropna().length).toBe(6)
    })
    test('filling missing values', () => {
        let s = new Series(["A", 0, 1, true, false, NaN, undefined, null])
        expect(s.fillna({method:"ffill"}).values.toArray()).toEqual([
            "A", 0, 1, true, false, false, false, null
        ])
        expect(s.fillna({method:"bfill"}).values.toArray()).toEqual([
            "A", 0, 1, true, false, null, null, null
        ])
        expect(s.fillna({value:"X"}).values.toArray()).toEqual([
            "A", 0, 1, true, false, "X", "X", null
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





