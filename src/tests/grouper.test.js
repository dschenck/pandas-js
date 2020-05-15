import { Index }   from '../core/Index'
import { Series }  from '../core/Series'
import { Grouper } from '../core/Grouper'
import * as utils  from '../core/utils'

describe("instanciation", () =>{
    let grouper = (new Series([1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9])).groupby(v => v >= 5)
    
    test("grouper", () => {
        expect(grouper).toBeInstanceOf(Grouper)
    })

    test("grouper groups size", () => {
        expect(grouper.groups.size).toEqual(2)
    })

    test("grouper index", () => {
        expect(grouper.index).toBeInstanceOf(Index)
    })

    test("groups keys", () => {
        expect(grouper.index.values).toEqual([false,true])
    })
})

describe("callback functions", () =>{
    let grouper = (new Series([1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9])).groupby(v => v >= 5)
    
    test("first", () => {
        expect(grouper.first().values).toEqual([1,5])
    })
    test("last", () => {
        expect(grouper.last().values).toEqual([4,9])
    })
    test("min", () =>{
        expect(grouper.min().values).toEqual([1,5])
    })
    test("max", () => {
        expect(grouper.max().values).toEqual([4,9])
    })
    test("sum", () => {
        expect(grouper.sum().iloc(0)).toEqual(20)
        expect(grouper.sum().loc(false)).toEqual(20)
    })
})