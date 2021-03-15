import stats from '../../core/stats'

test("base case", () => {
    const a = [true, false, true]
    expect(stats.all(a)).toEqual(false)

    const b = [true, true, true]
    expect(stats.all(b)).toEqual(true)

    const c = [false, false, false]
    expect(stats.all(c)).toEqual(false)
})