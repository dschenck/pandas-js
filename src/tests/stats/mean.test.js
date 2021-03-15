import stats from '../../core/stats'

test("mean", () => {
    const x = [NaN, 1, 3, 5, "Hello", undefined, new Date(), {}]

    expect(stats.mean(x)).toEqual(3)
})

