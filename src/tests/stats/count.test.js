import stats from '../../core/stats'

test("count", () => {
    const x = [NaN, 1, 3, 5, "Hello", undefined, new Date(), {}]
    
    expect(stats.count(x)).toEqual(3)
    expect(stats.count(x, {skipnan:false})).toEqual(6)
})