import { Index }   from '../core/Index'
import { Series } from '../core/Series'
import * as utils from '../core/utils'

let idx0 = new Index()
let idx1 = new Index(["A","B","C","D","E","F"], {name:"letters"})
let idx2 = new Index(utils.range(100), {name:"numbers"})

describe("instanciation", () => {
    it("should raise an error", () => {
        expect(() => new Index([1,1,2])).toThrow(Error)
    })
})

test('index length should be 100', () => {
    expect(idx0.length).toBe(0)
    expect(idx1.length).toBe(6)
    expect(idx2.length).toBe(100)
})

test('index name should be ', () => {
    expect(idx0.name).toBe(undefined)
    expect(idx1.name).toBe("letters")
    expect(idx2.name).toBe("numbers")
})

test("index should have", () => {
    expect(idx0.has(0)).toBe(false)
    expect(idx1.has("A")).toBe(true)
    expect(idx1.has("Z")).toBe(false)
    expect(idx2.has(50)).toBe(true)
    expect(idx2.has(100)).toBe(false)
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
        expect(idx1.slice(0,4)).toBeInstanceOf(Index)
        expect(idx1.slice(0,4).at(0)).toBe("A")
    })
    it("should throw an error", () => {
        expect(() => idx0.slice(0,1)).toThrow(Error)
    })
})

test('min', () => {
    expect(idx1.min()).toBe("A")
    expect(idx2.min()).toBe(0)
    expect(() => idx0.min()).toThrow(Error)
})

test('max', () => {
    expect(idx1.max()).toBe("F")
    expect(idx2.max()).toBe(99)
    expect(() => idx0.max()).toThrow(Error)
})

test('idxmax', () => {
    expect(idx1.idxmax()).toBe(5)
    expect(idx2.idxmax()).toBe(99)
})

test('reverse', () => {
    expect(idx0.reverse()).toBeInstanceOf(Index)
    expect(idx1.reverse().at(0)).toBe("F")
    expect(idx1.at(0)).toBe("A")
    expect(idx2.reverse().idxmax()).toBe(0)
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

test("sorting", () => {
    const idx = new Index([1,3,2,5,0,4])
    expect(idx.sort().values).toEqual([0,1,2,3,4,5])
    expect(idx.values).toEqual([1,3,2,5,0,4])
})




