import stats from '../../core/stats'

test("base case", () => {
    const arr = [-10, 4, 8]
    expect(stats.idxlast(arr)).toEqual(2)
})

test("with booleans", () => {
    const arr = [true, -10, -4]
    expect(stats.idxlast(arr)).toEqual(2)
    expect(stats.idxlast(arr, {skipnan:true})).toEqual(2)
    expect(stats.idxlast(arr, {skipnan:false})).toEqual(2)

    const alt = [false, -10, -4, false]
    expect(stats.idxlast(alt)).toEqual(3)
    expect(stats.idxlast(alt, {skipnan:false})).toEqual(3)
    expect(stats.idxlast(alt, {skipnan:true})).toEqual(3)
})

test("mixed data types", () => {
    const arr = [NaN, "test", 1, 3, 5, "Hello", undefined, new Date(), {}]
    expect(stats.idxlast(arr)).toEqual(8)
    expect(stats.idxlast(arr, {skipnan:false})).toEqual(8)
    expect(stats.idxlast(arr, {skipnan:true})).toEqual(4)
})

test("empty array", () => {
    const arr = []
    expect(stats.idxlast(arr)).toEqual(NaN)
    expect(stats.idxlast(arr, {skipnan:true})).toEqual(NaN)
    expect(stats.idxlast(arr, {skipnan:false})).toEqual(NaN)
})

test("array with non-numeric values only", () => {
    const arr = ["David","Bob"]
    expect(stats.idxlast(arr)).toEqual(1)
    expect(stats.idxlast(arr, {skipnan:false})).toEqual(1)
    expect(stats.idxlast(arr, {skipnan:true})).toEqual(NaN)
})
