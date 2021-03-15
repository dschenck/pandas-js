import stats from '../../core/stats'

test("base case", () => {
    const a = [true, false, true]
    expect(stats.any(a)).toEqual(true)

    const b = [true, true, true]
    expect(stats.any(b)).toEqual(true)

    const c = [false, false, false]
    expect(stats.any(c)).toEqual(false)
})