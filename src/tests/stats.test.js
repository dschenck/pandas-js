import * as stats  from '../core/stats'

test("all", () => {
    const a = [true, false, true]

    expect(stats.all(a)).toEqual(false)
    expect(stats.any(a)).toEqual(true)

    const b = [true, true, true]

    expect(stats.all(b)).toEqual(true)
    expect(stats.any(b)).toEqual(true)

    const c = [false, false, false]

    expect(stats.all(c)).toEqual(false)
    expect(stats.any(c)).toEqual(false)
})

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

