import stats from '../../core/stats'

test("base case", () => {
    const arr = [1,4,3,0,-10,20,21]
    expect(stats.cummin(arr)).toEqual([1,1,1,0,-10,-10,-10])
})

test("with NaN", () => {
    const arr = [NaN, 4, NaN, 3, 9]
    expect(stats.cummin(arr)).toEqual([NaN, 4, 4, 3, 3])
})

test("with more NaN", () => {
    const arr = [NaN, NaN, NaN, 3, 9]
    expect(stats.cummin(arr)).toEqual([NaN, NaN, NaN, 3, 3])
})

test("with non-numeric values", () => {
    const arr = [undefined, -10, "test"]
    expect(stats.cummin(arr)).toEqual([NaN, -10, -10])
})