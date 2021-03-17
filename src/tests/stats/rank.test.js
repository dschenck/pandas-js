import stats from '../../core/stats'

test("base case", () => {
    const arr = [3,5,1]
    expect(stats.rank(arr)).toEqual([2,3,1])
    expect(stats.rank(arr, {ascending:true})).toEqual([2,3,1])
    expect(stats.rank(arr, {ascending:false})).toEqual([2,1,3])
})

test("ties", () => {
    const arr = [3, 5, 5, 1, 3]
    expect(stats.rank(arr)).toEqual([2,4,4,1,2])
})