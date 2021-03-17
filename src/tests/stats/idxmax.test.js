import stats from '../../core/stats'

test("base case", () => {
    const arr = [1,5,2]
    expect(stats.idxmax(arr)).toEqual(1)
})

test("with booleans", () => {
    const arr = [-10, -2, true, -4]
    expect(stats.idxmax(arr)).toEqual(2)

    const alt = [-10, -2, false, -4]
    expect(stats.idxmax(alt)).toEqual(2)
})

test("with non-numeric values", () => {
    const arr = [-10, 4, NaN, new Date(), {}, undefined]
    expect(stats.idxmax(arr)).toEqual(1)
})

test("empty index", () => {
    const arr = []
    expect(stats.idxmax(arr)).toEqual(NaN)
})

test("array with no numeric value", () => {
    const arr = ["Sarah","Celine"]
    expect(stats.idxmax(arr)).toEqual(NaN)
})