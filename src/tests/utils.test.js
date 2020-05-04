import * as utils from '../core/utils'

describe("test typing", () => {
    test("test dates", () => {
        let d1 = new Date(2020, 1, 1)
        expect(utils.isDate(d1)).toBe(true)

        let d2 = new Date(NaN)
        expect(utils.isDate(d2)).toBe(false)

        expect(utils.isDate(123456789)).toBe(false)
        expect(utils.isDate(false)).toBe(false)
        expect(utils.isDate(true)).toBe(false)
        expect(utils.isDate("string")).toBe(false)
        expect(utils.isDate(NaN)).toBe(false)
        expect(utils.isDate(undefined)).toBe(false)
        expect(utils.isDate(null)).toBe(false)
        expect(utils.isDate({})).toBe(false)
        expect(utils.isDate(() => 1)).toBe(false)
    })
})

describe("default sorting", () => {
    test("number values", () => {
        let v = [1,-3,2,0,4]
        expect([...v].sort(utils.defaultsort)).toEqual([-3,0,1,2,4])
    })
    test("numeric values", () => {
        let v = [true,-3,2,false,4]
        expect([...v].sort(utils.defaultsort)).toEqual([-3,false,true,2,4])
    })
    test("numeric values with NaN", () => {
        let v = [true,-3,2,false,4,NaN,10]
        expect([...v].sort((a, b) => utils.defaultsort(a, b, {na:"last"}))).toEqual([-3,false,true,2,4,10,NaN])
        expect([...v].sort((a, b) => utils.defaultsort(a, b, {na:"first"}))).toEqual([NaN,-3,false,true,2,4,10])
    })
    test("numeric and strings should throw error", () => {
        let v = [1,2,3,"Hello",5,6,7]
        expect(() => v.sort(utils.defaultsort)).toThrow(Error)
    })
    test("string values", () => {
        let v = ["E","A","G"]
        expect([...v].sort(utils.defaultsort)).toEqual(["A","E","G"])
    })
    test("string values", () => {
        let v = ["E","A",NaN,"G"]
        expect([...v].sort(utils.defaultsort)).toEqual(["A","E","G",NaN])
    })
})



describe('test isListOfList', () => {
    test('list of values', () => {
        expect(utils.isListOfList([[1,2],[3,4]])).toBe(true)
    })
    test('list of values', () => {
        expect(utils.isListOfList([1,2,3,4,5])).toBe(false)
    })
})

describe('test range', () => {
    test('creation', () => {
        expect(utils.range(4)).toEqual([0,1,2,3])
        expect(utils.range(1, 4)).toEqual([1,2,3])
        expect(utils.range(1, 4, 2)).toEqual([1,3])
    })
})

describe('transposing', () => {
    test('transposing', () => {
        const m = [["A","B"],["C","D"]]
        expect(utils.transpose(m)).toEqual([["A","C"],["B","D"]])
    })
})

describe('all and any', () => {
    test('all', () => {
        
    })
})