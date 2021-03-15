import stats from '../../core/stats'


test("sum", () => {
    const x = [NaN, 1, 3, 5, "Hello", undefined, new Date(), {}]
    
    expect(stats.sum(x)).toEqual(9)
})