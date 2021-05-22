import stats from '../../core/stats'

test("Base case", () => {
    const values = [220, 220, 219, 219, 218, 222, 223, 221, 222, 224, 224, 221, 222, 217, 217, 212, 218, 219, 217, 214, 216, 213, 212, 216, 224, 224, 225, 229, 232, 232, 238, 231, 239, 239, 242, 241, 242, 242, 243, 242, 244, 244, 243, 244, 244, 241, 235, 233, 235, 229, 232, 230, 234, 228, 227, 232, 227, 234, 232, 237, 236, 235, 238, 237, 231, 230, 236, 238, 235, 232, 236, 235, 232, 236, 242, 249, 248, 250, 253, 256, 256, 258, 256, 260, 261, 259, 258, 261, 257, 261, 262, 262, 255, 253, 252, 252, 248, 246, 250, 252]

    const mdd = stats.mdd(values)
    expect(mdd.loss).toBeCloseTo(-0.069672131147541, 14)
    expect(mdd.trough).toEqual(54)
    expect(mdd.peak).toEqual(44)
    expect(mdd.recovery).toEqual(75)
    expect(mdd.open).toEqual(244)
    expect(mdd.close).toEqual(227)
})

test("With non-numeric values", () => {
    const values = [NaN, NaN, 219, 219, 218, 222, 223, 221, 222, 224, 224, 221, 222, 217, 217, 212, 218, 219, 217, 214, 216, 213, 212, 216, 224, 224, 225, 229, 232, 232, 238, 231, 239, 239, 242, 241, 242, 242, 243, 242, 244, 244, 243, 244, 244, 241, 235, 233, 235, 229, 232, NaN, 234, 228, 227, 232, 227, 234, 232, 237, 236, 235, 238, 237, 231, 230, 236, 238, 235, 232, 236, 235, 232, 236, 242, 249, 248, 250, 253, 256, 256, 258, 256, 260, 261, 259, 258, 261, 257, 261, 262, 262, 255, 253, 252, 252, 248, 246, 250, 252]

    const mdd = stats.mdd(values)
    expect(mdd.loss).toBeCloseTo(-0.069672131147541, 14)
    expect(mdd.trough).toEqual(54)
    expect(mdd.peak).toEqual(44)
    expect(mdd.recovery).toEqual(75)
    expect(mdd.open).toEqual(244)
    expect(mdd.close).toEqual(227)
})

test("No drawdown", () => {
    const mdd = stats.mdd([3, 4, 5, 6, 7, 8, 9])

    expect(mdd.loss).toEqual(0)
    expect(mdd.peak).toBeUndefined()
})

test("No recovery", () => {
    const values = [NaN, NaN, 219, 219, 218, 222, 223, 221, 222, 224, 224, 221, 222, 217, 217, 212, 218, 219, 217, 214, 216, 213, 212, 216, 224, 224, 225, 229, 232, 232, 238, 231, 239, 239, 242, 241, 242, 242, 243, 242, 244, 244, 243, 244, 244, 241, 235, 233, 235, 229, 232, NaN, 234, 228, 227, 232, 227, 234, 232, 237, 236, 235, 238, 237, 231, 230, 236, 238, 235, 232, 236, 235, 232, 236]

    const mdd = stats.mdd(values)
    expect(mdd.loss).toBeCloseTo(-0.069672131147541, 14)
    expect(mdd.trough).toEqual(54)
    expect(mdd.peak).toEqual(44)
    expect(mdd.recovery).toBeUndefined()
    expect(mdd.open).toEqual(244)
    expect(mdd.close).toEqual(227)
})
