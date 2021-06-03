import stats from '../../core/stats'

test("base case", () => {
    const x = [0, 10, 11]
    const y = [0, 10, 11]

    expect(stats.covar(x, y)).toBeCloseTo(11)
})