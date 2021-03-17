import stats from '../../core/stats'

test("base case", () => {
    const arr = [-10, 4, 8]
    expect(stats.min(arr)).toEqual(-10)
})

test("with booleans", () => {
    const arr = [10, 4, true]
    expect(stats.min(arr)).toEqual(true)

    const arr2 = [10, 4, false]
    expect(stats.min(arr2)).toEqual(false)
})

test("mixed data types", () => {
    const arr = [NaN, 1, 3, 5, "Hello", undefined, new Date(), {}]
    expect(stats.min(arr)).toEqual(1)
})

test("empty array", () => {
    const arr = []
    expect(stats.min(arr)).toEqual(NaN)
})

test("array with non-numeric values only", () => {
    const arr = ["David","Bob"]
    expect(stats.min(arr)).toEqual(NaN)
})
