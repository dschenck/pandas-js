import { Axis }  from '../core/Axes'
import * as utils from '../core/utils'

let idx0 = new Axis()
let idx1 = new Axis(["A","B","C","D","E","F"], {name:"letters"})
let idx2 = new Axis(utils.range(100), {name:"numbers"})

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
        expect(idx1.slice(0,4)).toBeInstanceOf(Axis)
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
    expect(idx0.reverse()).toBeInstanceOf(Axis)
    expect(idx1.reverse().at(0)).toBe("F")
    expect(idx1.at(0)).toBe("A")
    expect(idx2.reverse().idxmax()).toBe(0)
})

test("mask", () => {
    expect(idx1.mask([false,true,false,true,false,true])).toBeInstanceOf(Axis)
    expect(idx1.mask([false,true,false,true,false,true]).length).toBe(3)
    //expect(idx1.mask([false,true,false,true,false,true]).at(0)).toBe("B")
})





