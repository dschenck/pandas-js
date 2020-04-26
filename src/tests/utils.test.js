import * as utils from '../core/utils'

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