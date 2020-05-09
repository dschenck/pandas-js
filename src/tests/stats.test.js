import * as stats  from '../core/stats'

test("sum", () => {
    const x = [NaN, 1, 3, 5, "Hello", undefined, new Date(), {}]
    
    expect(stats.sum(x)).toEqual(9)
})

test("count", () => {
    const x = [NaN, 1, 3, 5, "Hello", undefined, new Date(), {}]
    
    expect(stats.count(x)).toEqual(3)
    expect(stats.count(x, {skipnan:false})).toEqual(6)
})

test("mean", () => {
    const x = [NaN, 1, 3, 5, "Hello", undefined, new Date(), {}]

    expect(stats.mean(x)).toEqual(3)
})

