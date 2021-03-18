import stats from '../../core/stats'

test("base case", () => {
    const arr = [-10, 4, 8]
    expect(stats.idxfirst(arr)).toEqual(0)
})

test("with booleans", () => {
    const arr = [true, -10, -4]
    expect(stats.idxfirst(arr)).toEqual(0)
    expect(stats.idxfirst(arr, {skipnan:true})).toEqual(0)
    expect(stats.idxfirst(arr, {skipnan:false})).toEqual(0)

    const alt = [false, -10, -4, false]
    expect(stats.idxfirst(alt)).toEqual(0)
    expect(stats.idxfirst(alt, {skipnan:false})).toEqual(0)
    expect(stats.idxfirst(alt, {skipnan:true})).toEqual(0)
})

test("mixed data types", () => {
    const arr = [NaN, "test", 1, 3, 5, "Hello", undefined, new Date(), {}]
    expect(stats.idxfirst(arr)).toEqual(1)
    expect(stats.idxfirst(arr, {skipnan:false})).toEqual(1)
    expect(stats.idxfirst(arr, {skipnan:true})).toEqual(2)
})

test("empty array", () => {
    const arr = []
    expect(stats.idxfirst(arr)).toEqual(NaN)
    expect(stats.idxfirst(arr, {skipnan:true})).toEqual(NaN)
    expect(stats.idxfirst(arr, {skipnan:false})).toEqual(NaN)
})

test("array with non-numeric values only", () => {
    const arr = ["David","Bob"]
    expect(stats.idxfirst(arr)).toEqual(0)
    expect(stats.idxfirst(arr, {skipnan:false})).toEqual(0)
    expect(stats.idxfirst(arr, {skipnan:true})).toEqual(NaN)
})
