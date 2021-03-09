import bisect from '../../core/libs/bisect'

test("bisection", () => {
    const arr = [1,3,5,7,9,11]

    expect(() => bisect.asof(arr, 0)).toThrow(Error)
    expect(bisect.asof(arr, 1)).toBe(1)
    expect(bisect.asof(arr, 2)).toBe(1)
    expect(bisect.asof(arr, 3)).toBe(3)
    expect(bisect.asof(arr, 9)).toBe(9)
    expect(bisect.asof(arr, 10)).toBe(9)
    expect(bisect.asof(arr, 11)).toBe(11)
    expect(bisect.asof(arr, 99)).toBe(11)
})