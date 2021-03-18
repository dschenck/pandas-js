import stats from '../../core/stats'

test("base case", () => {
    const x = [NaN, 1, 3, 5, "Hello", undefined, new Date(), {}]
    expect(stats.count(x)).toEqual(6)
    expect(stats.count(x, {skipnan:true})).toEqual(3)
    expect(stats.count(x, {skipnan:false})).toEqual(6)
})

test("booleans", () => {
    const x = [true, false, "test"]
    expect(stats.count(x)).toEqual(3)
    expect(stats.count(x, {skipnan:true})).toEqual(2)
    expect(stats.count(x, {skipnan:false})).toEqual(3)
})

test("empty array", () => {
    const x = []
    expect(stats.count(x)).toEqual(0)
})

test("array with undefined values only", () => {
    const x = [null,undefined,NaN]
    expect(stats.count(x)).toEqual(0)
})