import stats from '../../core/stats'

test("base case", () => {
    const arr = [1,4,3,0,-10,20,21]
    expect(stats.cummax(arr)).toEqual([1,4,4,4,4,20,21])
})

test("with NaN", () => {
    const arr = [NaN, 4, NaN, 3, 9]
    expect(stats.cummax(arr)).toEqual([NaN, 4, 4, 4, 9])
})

test("with more NaN", () => {
    const arr = [NaN, NaN, NaN, 3, 9]
    expect(stats.cummax(arr)).toEqual([NaN, NaN, NaN, 3, 9])
})

test("with non-numeric values", () => {
    const arr = [undefined, -10, "test"]
    expect(stats.cummax(arr)).toEqual([NaN, -10, -10])
})