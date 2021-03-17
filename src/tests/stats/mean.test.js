import stats from '../../core/stats'

test("base case", () => {
    const arr = [2,4,6,8]
    expect(stats.mean(arr)).toEqual(5)
})

test("booleans", () => {
    const arr = [true, false, true, false, true]
    expect(stats.mean(arr)).toEqual(0.6)
})

test("mixed data types", () => {
    const x = [NaN, 1, 3, 5, "Hello", undefined, new Date(), {}]
    expect(stats.mean(x)).toEqual(3)
})

