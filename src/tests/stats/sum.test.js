import stats from '../../core/stats'

test("base case", () => {
    const arr = [-1,5,3]
    expect(stats.sum(arr)).toEqual(7)
})

test("array of booleans", () => {
    const arr = [true, false, true]
    expect(stats.sum(arr)).toEqual(2)
})

test("with mixed data types", () => {
    const x = [NaN, 1, 3, 5, "Hello", undefined, new Date(), {}]
    expect(stats.sum(x)).toEqual(9)
})

test("empty array", () => {
    const arr = []
    expect(stats.sum(arr)).toEqual(NaN)
})

test("array with non-numeric values only", () => {
    const arr = ["A","B"]
    expect(stats.sum(arr)).toEqual(NaN)
})