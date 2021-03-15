import stats from '../../core/stats'

test("base case", () => {
    const arr = [1,4,3,0,-10,20,21]
    expect(stats.cumsum(arr)).toEqual([1,5,8,8,-2,18,39])
})

test("with NaN", () => {
    const arr = [NaN, 4, NaN, 3, 9]
    expect(stats.cumsum(arr)).toEqual([NaN, 4, 4, 7, 16])
})

test("with more NaN", () => {
    const arr = [NaN, NaN, NaN, 3, 9]
    expect(stats.cumsum(arr)).toEqual([NaN, NaN, NaN, 3, 12])
})

test("with non-numeric values", () => {
    const arr = [undefined, -10, "test"]
    expect(stats.cumsum(arr)).toEqual([NaN, -10, -10])
})