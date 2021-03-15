import stats from '../../core/stats'

test("base case", () => {
    const arr = [1,4,3,1,-10,20]
    expect(stats.cumprod(arr)).toEqual([1,4,12,12,-120,-2400])
})

test("with NaN", () => {
    const arr = [NaN, 4, NaN, 3, 9]
    expect(stats.cumprod(arr)).toEqual([NaN, 4, 4, 12, 108])
})

test("with more NaN", () => {
    const arr = [NaN, NaN, NaN, 3, 9]
    expect(stats.cumprod(arr)).toEqual([NaN, NaN, NaN, 3, 27])
})

test("with non-numeric values", () => {
    const arr = [undefined, -10, "test"]
    expect(stats.cumprod(arr)).toEqual([NaN, -10, -10])
})