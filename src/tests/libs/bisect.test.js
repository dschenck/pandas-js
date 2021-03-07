import bisect from '../../core/libs/bisect'

test("bisection", () => {
    const arr = [1,3,5,7,9,11]

    expect(bisect.bisect(arr, 0)).toBe(0)
    expect(bisect.bisect(arr, 1)).toBe(0)
    expect(bisect.bisect(arr, 2)).toBe(1)
    expect(bisect.bisect(arr, 3)).toBe(1)
    expect(bisect.bisect(arr, 9)).toBe(arr.length - 2)
    expect(bisect.bisect(arr, 10)).toBe(arr.length - 1)
    expect(bisect.bisect(arr, 11)).toBe(arr.length - 1)
    expect(bisect.bisect(arr, 12)).toBe(arr.length)
    expect(bisect.bisect(arr, 99)).toBe(arr.length)
})