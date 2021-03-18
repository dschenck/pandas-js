import stats from '../../core/stats'

test("base case", () => {
    const arr = [-10, 4, 8]
    expect(stats.last(arr)).toEqual(8)
})

test("with booleans", () => {
    const arr = [true, -10, -4]
    expect(stats.last(arr)).toEqual(-4)
    expect(stats.last(arr, {skipnan:true})).toEqual(-4)
    expect(stats.last(arr, {skipnan:false})).toEqual(-4)

    const alt = [false, -10, -4, false]
    expect(stats.last(alt)).toEqual(false)
    expect(stats.last(alt, {skipnan:false})).toEqual(false)
    expect(stats.last(alt, {skipnan:true})).toEqual(false)
})

test("mixed data types", () => {
    const arr = [NaN, "test", 1, 3, 5, "Hello", undefined, new Date(), {}]
    expect(stats.last(arr)).toEqual({})
    expect(stats.last(arr, {skipnan:false})).toEqual({})
    expect(stats.last(arr, {skipnan:true})).toEqual(5)
})

test("empty array", () => {
    const arr = []
    expect(stats.last(arr)).toEqual(NaN)
    expect(stats.last(arr, {skipnan:true})).toEqual(NaN)
    expect(stats.last(arr, {skipnan:false})).toEqual(NaN)
})

test("array with non-numeric values only", () => {
    const arr = ["David","Bob"]
    expect(stats.last(arr)).toEqual("Bob")
    expect(stats.last(arr, {skipnan:false})).toEqual("Bob")
    expect(stats.last(arr, {skipnan:true})).toEqual(NaN)
})
