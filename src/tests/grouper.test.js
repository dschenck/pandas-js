import Series      from '../core/Series'
import { SeriesGroupby, Pivot } from '../core/Grouper'

describe("instanciation", () =>{
    let grouper = (new Series([1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9])).groupby(v => v >= 5)
    
    test("grouper", () => {
        expect(grouper).toBeInstanceOf(SeriesGroupby)
    })

    test("grouper groups size", () => {
        expect(grouper.groups.length).toEqual(2)
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

describe("Pivot table", () => {
    const srs = new Series([0,1,2,3,4,5,6,7,8,9], {name:"numbers"})
    const pivot = srs.pivot({index:v => v > 5, columns:v => v % 2 == 0})

    test("instanciation", () => {
        expect(pivot).toBeInstanceOf(Pivot)
    })
    test("groups", () => {
        expect(pivot.groups).toBeInstanceOf(Array)
    })
    test("group values and names", () => {
        expect(pivot.groups[0].values).toEqual([0,2,4])
        expect(pivot.groups[0].index).toEqual([0,2,4])
        expect(pivot.groups[0].name).toEqual([false, true])
        expect(pivot.groups[1].values).toEqual([1,3,5])
        expect(pivot.groups[1].index).toEqual([1,3,5])
        expect(pivot.groups[1].name).toEqual([false, false])
    })
    test("pivot.first", () => {
        expect(pivot.first().index.values).toEqual([false, true])
        expect(pivot.first().columns.values).toEqual([false, true])
        expect(pivot.first().values).toEqual([[1,0],[7,6]])
    })
})