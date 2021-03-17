import stats from '../../core/stats'

test("base case", () => {
    const arr = [-10, 4, 8]
    expect(stats.max(arr)).toEqual(8)
})

test("with booleans", () => {
    const arr = [-10, -4, true]
    expect(stats.max(arr)).toEqual(true)

    const arr2 = [-10, -4, false]
    expect(stats.max(arr2)).toEqual(false)
})

test("mixed data types", () => {
    const arr = [NaN, 1, 3, 5, "Hello", undefined, new Date(), {}]
    expect(stats.max(arr)).toEqual(5)
})

test("empty array", () => {
    const arr = []
    expect(stats.max(arr)).toEqual(NaN)
})

test("array with non-numeric values only", () => {
    const arr = ["David","Bob"]
    expect(stats.max(arr)).toEqual(NaN)
})
