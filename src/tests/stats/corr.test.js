import stats from '../../core/stats'

test("base case", () => {
    const x = [0, 10, 11]
    const y = [0, 10, 11]

    expect(stats.corr(x, y)).toBeCloseTo(1, 10)

})

test("with non-numeric values case", () => {
    const x = [0, NaN, 10, 20, 11]
    const y = [0, 5, 10, NaN, 11]

    expect(stats.corr(x, y)).toBeCloseTo(1, 10)
})